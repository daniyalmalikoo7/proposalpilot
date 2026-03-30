// Streaming AI section generation endpoint.
// Streams Anthropic SSE deltas → client SSE events, then fires a "complete" event
// with the full validated JSON so the client can update the editor and save.

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
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

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const RequestSchema = z.object({
  proposalId: z.string().cuid(),
  sectionTitle: z.string().min(1).max(255),
  requirements: z.array(z.string()).min(1).max(20),
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

  // Verify proposal + org ownership
  const proposal = await db.proposal.findFirst({
    where: { id: input.proposalId, orgId },
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

  const readable = new ReadableStream({
    async start(controller) {
      const t0 = Date.now();
      let fullContent = "";

      try {
        const stream = client.messages.stream({
          model: "claude-sonnet-4-6",
          system: prompt.systemMessage,
          messages: [{ role: "user", content: userMessage }],
          max_tokens: prompt.metadata.max_tokens,
          temperature: prompt.metadata.temperature,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const delta = event.delta.text;
            fullContent += delta;
            // Forward raw delta to client
            controller.enqueue(
              encoder.encode(
                `event: delta\ndata: ${JSON.stringify({ delta })}\n\n`,
              ),
            );
          }
        }

        // Collect final message for usage stats
        const finalMessage = await stream.finalMessage();
        const usage = finalMessage.usage;

        logAICall(
          {
            content: fullContent,
            usage: {
              inputTokens: usage.input_tokens,
              outputTokens: usage.output_tokens,
              cost: calculateCost(
                "claude-sonnet-4-6",
                usage.input_tokens,
                usage.output_tokens,
              ),
            },
            latencyMs: Date.now() - t0,
            model: "claude-sonnet-4-6",
            cached: false,
          },
          "section-generator",
        );

        // Validate and guard the full JSON output
        const guardResult = await runGuards(fullContent, kbContext);

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

        let parsed: z.infer<typeof SectionGeneratorOutputSchema>;
        try {
          parsed = SectionGeneratorOutputSchema.parse(
            JSON.parse(fullContent) as unknown,
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
            `event: complete\ndata: ${JSON.stringify(parsed)}\n\n`,
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
