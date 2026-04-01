// Streaming AI section generation endpoint.
// Streams Gemini deltas → client SSE events, then fires a "complete" event
// with the full validated JSON so the client can update the editor and save.

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
  loadPrompt,
  renderPrompt,
  sanitizeForPrompt,
} from "@/lib/ai/prompts/base";
import { SectionGeneratorOutputSchema } from "@/lib/ai/validators/section-generator-output";
import { calculateCost, logAICall } from "@/lib/ai/cost-tracker";
import { runGuards } from "@/lib/ai/guards/hallucination";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { env } from "@/lib/config";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import { isAppError } from "@/lib/types/errors";

let _genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) _genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);
  return _genAI;
}

const RequestSchema = z.object({
  proposalId: z.string().cuid(),
  sectionTitle: z.string().min(1).max(255),
  requirements: z.array(z.string()).min(0).max(50),
  kbItemIds: z.array(z.string().cuid()).max(10).default([]),
  instructions: z.string().max(2000).default(""),
});

export async function POST(req: NextRequest): Promise<Response> {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // SEC-004: 20 AI calls per minute per user
  try {
    checkRateLimit(`ai:${userId}`, 20, 60_000);
  } catch (err) {
    if (isAppError(err)) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const body: unknown = await req.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", issues: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const input = parsed.data;

  // Resolve internal org CUID from Clerk org ID.
  // Proposal.orgId stores the internal DB primary key, not the Clerk "org_xxx" ID.
  // This mirrors the orgProtectedProcedure lookup in src/server/trpc.ts.
  const org = await db.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });

  if (!org) {
    return new Response(JSON.stringify({ error: "Organization not found" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `[stream-section] proposalId=${input.proposalId} clerkOrgId=${orgId} internalOrgId=${org.id}`,
  );

  // Verify proposal + org ownership using the internal org ID
  const proposal = await db.proposal.findFirst({
    where: { id: input.proposalId, orgId: org.id },
    select: { id: true, title: true, orgId: true },
  });

  if (!proposal) {
    return new Response(JSON.stringify({ error: "Proposal not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch brand voice + KB context
  const [brandVoice, kbItems] = await Promise.all([
    db.brandVoice.findUnique({ where: { orgId: proposal.orgId } }),
    input.kbItemIds.length > 0
      ? db.knowledgeBaseItem.findMany({
          where: {
            id: { in: input.kbItemIds },
            orgId: proposal.orgId,
            isActive: true,
          },
          select: { id: true, title: true, content: true, type: true },
        })
      : Promise.resolve([]),
  ]);

  const brandVoiceText = brandVoice
    ? `Tone: ${sanitizeForPrompt(brandVoice.tone)}`
    : "Professional, clear, and concise. Use active voice and first-person plural.";

  const kbContext =
    kbItems.length > 0
      ? kbItems
          .map(
            (item) =>
              `[KB Item ID: ${item.id}]\nType: ${item.type}\nTitle: ${sanitizeForPrompt(item.title)}\n\n${sanitizeForPrompt(item.content)}`,
          )
          .join("\n\n---\n\n")
      : "No knowledge base context available.";

  const requirementsText = input.requirements
    .map((req, i) => `${i + 1}. ${req}`)
    .join("\n");

  const prompt = loadPrompt("section-generator");

  const userMessage = renderPrompt(prompt.userTemplate, {
    proposal_title: proposal.title,
    section_title: input.sectionTitle,
    requirements: requirementsText,
    brand_voice: brandVoiceText,
    kb_context: kbContext,
    instructions: input.instructions || "None.",
  });

  const encoder = new TextEncoder();
  // Keep in sync with src/lib/ai/fallback-chain.ts FALLBACK_CHAIN[0]
  const MODEL_NAME = "gemini-2.5-flash";

  const readable = new ReadableStream({
    async start(controller) {
      const t0 = Date.now();
      let fullContent = "";

      try {
        const model = getGenAI().getGenerativeModel({
          model: MODEL_NAME,
          systemInstruction: prompt.systemMessage,
          generationConfig: {
            maxOutputTokens: prompt.metadata.max_tokens,
            temperature: prompt.metadata.temperature,
          },
        });

        const streamResult = await model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        });

        for await (const chunk of streamResult.stream) {
          const delta = chunk.text();
          if (delta) {
            fullContent += delta;
            controller.enqueue(
              encoder.encode(
                `event: delta\ndata: ${JSON.stringify({ delta })}\n\n`,
              ),
            );
          }
        }

        // Collect final response for usage stats
        const aggregated = await streamResult.response;
        const inputTokens = aggregated.usageMetadata?.promptTokenCount ?? 0;
        const outputTokens =
          aggregated.usageMetadata?.candidatesTokenCount ?? 0;

        logAICall(
          {
            content: fullContent,
            usage: {
              inputTokens,
              outputTokens,
              cost: calculateCost(MODEL_NAME, inputTokens, outputTokens),
            },
            latencyMs: Date.now() - t0,
            model: MODEL_NAME,
            cached: false,
          },
          "section-generator",
        );

        // Strip markdown fences BEFORE guards so json_validity sees clean JSON
        const jsonText = fullContent
          .replace(/^```(?:json)?\s*/m, "")
          .replace(/\s*```\s*$/m, "")
          .trim();

        // Validate and guard the full JSON output (on fence-stripped content)
        const guardResult = await runGuards(jsonText, kbContext);

        if (guardResult.blocked) {
          logger.warn("stream-section guard blocked output", {
            failures: guardResult.failures,
          });
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: "Output blocked by safety guard", failures: guardResult.failures })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        let validatedOutput: z.infer<typeof SectionGeneratorOutputSchema>;
        try {
          // jsonText already has fences stripped above
          validatedOutput = SectionGeneratorOutputSchema.parse(
            JSON.parse(jsonText) as unknown,
          );
        } catch (err) {
          logger.error("stream-section JSON parse failed", {
            error: err instanceof Error ? err.message : String(err),
          });
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: "AI output could not be parsed" })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        // Emit complete event with validated output
        controller.enqueue(
          encoder.encode(
            `event: complete\ndata: ${JSON.stringify(validatedOutput)}\n\n`,
          ),
        );
      } catch (err) {
        logger.error("stream-section failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: "Generation failed" })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
