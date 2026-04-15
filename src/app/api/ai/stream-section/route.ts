// Streaming AI section generation endpoint — two-phase architecture:
//   Phase 1: Stream raw Markdown content token-by-token via SSE delta events.
//            No JSON wrapper → word-by-word delivery without paragraph buffering.
//   Phase 2: After streaming ends, one non-streaming call generates metadata
//            (confidence_score, requirements_addressed, citations).
//            Sent as the "complete" SSE event with the same shape as before.

// Allow up to 300 s for SSE streaming responses (Phase 1 generation can take 45–90 s
// for long proposals; Phase 2 metadata adds another 10–20 s).
// Edge runtime is not viable here because this route uses Prisma (Node.js runtime required).
export const maxDuration = 300;

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
  loadPrompt,
  renderPrompt,
  sanitizeForPrompt,
} from "@/lib/ai/prompts/base";
import {
  SectionGeneratorOutputSchema,
  RequirementAddressedSchema,
  CitationSchema,
} from "@/lib/ai/validators/section-generator-output";
import { calculateCost, logAICall } from "@/lib/ai/cost-tracker";
import {
  VoyageEmbeddingProvider,
  searchSimilar,
} from "@/lib/services/embeddings";
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

// Phase 1 model chain for streaming raw Markdown content.
// Try most capable first, fall back on 503/quota errors.
const STREAM_MODEL_CHAIN = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;

// Phase 2 model for metadata extraction (non-streaming, structured JSON).
// Uses the lighter flash-lite model — this is a short structured-extraction
// task, not a long creative generation.
const META_MODEL = "gemini-2.5-flash-lite";

// System prompt for Phase 2 metadata extraction.
const META_SYSTEM_PROMPT = `You are a proposal quality evaluator. Given a completed proposal section, the requirements it addressed, and the available knowledge base context, assess the section quality and return a JSON metadata object. Return ONLY valid JSON — no prose, no markdown fences.`;

let _voyageProvider: VoyageEmbeddingProvider | null = null;
function getVoyageProvider(): VoyageEmbeddingProvider {
  if (!_voyageProvider) _voyageProvider = new VoyageEmbeddingProvider();
  return _voyageProvider;
}

const RequestSchema = z.object({
  proposalId: z.string().cuid(),
  sectionTitle: z.string().min(1).max(255),
  requirements: z.array(z.string()).min(0).max(50),
  kbItemIds: z.array(z.string()).optional().default([]),
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

  logger.info("[stream-section] request received", {
    proposalId: input.proposalId,
    clerkOrgId: orgId,
    internalOrgId: org.id,
  });

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

  // Resolve effective KB item IDs.
  // Manual selection (kbItemIds provided by client) takes precedence.
  // When none are provided, run auto-RAG: embed the section title + requirements
  // and retrieve the top-5 most relevant KB documents via pgvector similarity.
  let effectiveKbItemIds: string[] = input.kbItemIds;

  if (effectiveKbItemIds.length === 0) {
    // Search query: section title + first 3 requirements, capped at 200 words.
    // This keeps the embedding focused on the section's intent rather than
    // diluting it with a full requirements list.
    const rawQuery = [
      input.sectionTitle,
      ...input.requirements.slice(0, 3),
    ].join(" ");
    const searchQuery = rawQuery.split(/\s+/).slice(0, 200).join(" ");

    try {
      const queryEmbedding = await getVoyageProvider().embed(searchQuery);
      const matches = await searchSimilar(db, org.id, queryEmbedding, {
        limit: 5,
      });
      effectiveKbItemIds = matches.map((m) => m.id);
      logger.info("Auto-RAG: retrieved KB items for section", {
        proposalId: input.proposalId,
        sectionTitle: input.sectionTitle,
        itemCount: effectiveKbItemIds.length,
      });
    } catch (err) {
      // Non-fatal: generation continues without KB context.
      logger.warn("Auto-RAG search failed — proceeding without KB context", {
        proposalId: input.proposalId,
        sectionTitle: input.sectionTitle,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  } else {
    logger.info("Manual-RAG: user-selected KB items for section", {
      proposalId: input.proposalId,
      sectionTitle: input.sectionTitle,
      itemCount: effectiveKbItemIds.length,
    });
  }

  // Fetch brand voice + KB context in parallel using resolved IDs
  const [brandVoice, kbItems] = await Promise.all([
    db.brandVoice.findUnique({ where: { orgId: proposal.orgId } }),
    effectiveKbItemIds.length > 0
      ? db.knowledgeBaseItem.findMany({
          where: {
            id: { in: effectiveKbItemIds },
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
        // ── Phase 1: Stream raw Markdown content ────────────────────────────
        // Try each model in the chain; generateContentStream throws immediately
        // on 503/quota errors so we can fall through to the next model.
        let activeModel = "";

        for (const modelName of STREAM_MODEL_CHAIN) {
          try {
            const candidate = getGenAI().getGenerativeModel({
              model: modelName,
              systemInstruction: prompt.systemMessage,
              generationConfig: {
                maxOutputTokens: prompt.metadata.max_tokens,
                temperature: prompt.metadata.temperature,
              },
            });
            const streamResult = await candidate.generateContentStream({
              contents: [{ role: "user", parts: [{ text: userMessage }] }],
            });
            activeModel = modelName;

            // Forward each token chunk immediately — no buffering.
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

            // Log streaming call usage after stream drains
            const aggregated = await streamResult.response;
            const inputTokens =
              aggregated.usageMetadata?.promptTokenCount ?? 0;
            const outputTokens =
              aggregated.usageMetadata?.candidatesTokenCount ?? 0;
            logAICall(
              {
                content: fullContent,
                usage: {
                  inputTokens,
                  outputTokens,
                  cost: calculateCost(activeModel, inputTokens, outputTokens),
                },
                latencyMs: Date.now() - t0,
                model: activeModel,
                cached: false,
              },
              "section-generator-stream",
            );

            break; // success — exit model fallback loop
          } catch (modelErr) {
            logger.warn("stream-section model unavailable, trying next", {
              model: modelName,
              error:
                modelErr instanceof Error
                  ? modelErr.message.slice(0, 120)
                  : String(modelErr),
            });
          }
        }

        if (!fullContent) {
          throw new Error("All generation models are currently unavailable");
        }

        // ── Phase 2: Metadata extraction (non-streaming) ────────────────────
        // Ask a lighter model to score the already-generated content against
        // the requirements and KB.
        //
        // IMPORTANT: the complete event is emitted from INSIDE this try/catch so
        // that fullContent is never lost if Phase 2 fails.  Any error — network
        // timeout, Gemini quota, JSON parse failure — falls to the catch branch
        // which immediately sends the complete event with content + zero confidence.
        const fallbackCompletePayload: z.infer<typeof SectionGeneratorOutputSchema> = {
          title: input.sectionTitle,
          content: fullContent,
          confidence_score: 0,
          requirements_addressed: input.requirements.map((_, i) => ({
            requirement_index: i,
            addressed: true,
            how_addressed: "Addressed in the generated section content",
          })),
          citations: [],
          review_notes: null,
        };

        try {
          const metaUserPrompt = [
            `Section Title: ${sanitizeForPrompt(input.sectionTitle)}`,
            "",
            "Generated Section Content:",
            sanitizeForPrompt(fullContent),
            "",
            "Requirements to Address:",
            requirementsText,
            "",
            "Knowledge Base Context Available:",
            kbContext.slice(0, 4000),
            "",
            "Return JSON matching this schema exactly:",
            JSON.stringify({
              confidence_score: "number 0.0–1.0",
              requirements_addressed: [
                {
                  requirement_index: "number (0-based)",
                  addressed: "boolean",
                  how_addressed: "string max 100 chars",
                },
              ],
              citations: [
                { kb_item_id: "string", relevance: "string max 100 chars" },
              ],
              review_notes: "string or null",
            }),
          ].join("\n");

          const t1 = Date.now();
          const metaModel = getGenAI().getGenerativeModel({
            model: META_MODEL,
            systemInstruction: META_SYSTEM_PROMPT,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          });

          const metaResult = await metaModel.generateContent({
            contents: [{ role: "user", parts: [{ text: metaUserPrompt }] }],
          });

          const metaText = metaResult.response.text();
          const metaInputTokens =
            metaResult.response.usageMetadata?.promptTokenCount ?? 0;
          const metaOutputTokens =
            metaResult.response.usageMetadata?.candidatesTokenCount ?? 0;

          logAICall(
            {
              content: metaText,
              usage: {
                inputTokens: metaInputTokens,
                outputTokens: metaOutputTokens,
                cost: calculateCost(META_MODEL, metaInputTokens, metaOutputTokens),
              },
              latencyMs: Date.now() - t1,
              model: META_MODEL,
              cached: false,
            },
            "section-generator-meta",
          );

          const MetaSchema = z.object({
            confidence_score: z.number().min(0).max(1),
            requirements_addressed: z.array(RequirementAddressedSchema),
            citations: z.array(CitationSchema),
            review_notes: z.string().nullable(),
          });
          const parsedMeta = MetaSchema.safeParse(JSON.parse(metaText) as unknown);

          let completePayload: z.infer<typeof SectionGeneratorOutputSchema>;
          if (parsedMeta.success) {
            completePayload = {
              title: input.sectionTitle,
              content: fullContent,
              ...parsedMeta.data,
            };
          } else {
            logger.warn(
              "stream-section metadata parse failed — sending content without scores",
              { error: parsedMeta.error.message },
            );
            completePayload = fallbackCompletePayload;
          }

          // ── Emit complete event ───────────────────────────────────────────
          controller.enqueue(
            encoder.encode(
              `event: complete\ndata: ${JSON.stringify(completePayload)}\n\n`,
            ),
          );
        } catch (metaErr) {
          logger.warn(
            "Phase 2 metadata call failed — sending content without scores",
            {
              error:
                metaErr instanceof Error ? metaErr.message : String(metaErr),
            },
          );
          // Always emit complete with the streamed content so it is never lost.
          controller.enqueue(
            encoder.encode(
              `event: complete\ndata: ${JSON.stringify(fallbackCompletePayload)}\n\n`,
            ),
          );
        }
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
