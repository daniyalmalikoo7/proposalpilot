// GenerateSectionService — drafts a proposal section using Claude Sonnet.
// Implements CLAUDE.md AI/GenAI Invariants: prompt versioning, structured output, cost tracking.

import { z } from "zod";
import { loadPrompt, renderPrompt } from "@/lib/ai/prompts/base";
import { executeWithFallback } from "@/lib/ai/fallback-chain";
import { SectionGeneratorOutputSchema } from "@/lib/ai/validators/section-generator-output";
import type { SectionGeneratorOutput } from "@/lib/ai/validators/section-generator-output";
import type { GenerateResult } from "@/lib/ai/providers/types";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export interface GenerateSectionParams {
  proposalId: string;
  sectionTitle: string;
  requirementTexts: string[];
  /** IDs of KB items to include as context */
  kbItemIds?: string[];
  instructions?: string;
}

export interface GenerateSectionResult {
  output: SectionGeneratorOutput;
  metadata: GenerateResult;
}

/**
 * Generate a proposal section draft.
 * Loads KB context and brand voice from DB, then calls executeWithFallback
 * with the section-generator prompt.
 */
export async function generateSection(
  params: GenerateSectionParams,
): Promise<GenerateSectionResult> {
  const {
    proposalId,
    sectionTitle,
    requirementTexts,
    kbItemIds = [],
    instructions = "",
  } = params;

  // Fetch proposal title + org for context
  const proposal = await db.proposal.findUniqueOrThrow({
    where: { id: proposalId },
    select: { title: true, orgId: true },
  });

  // Fetch brand voice
  const brandVoice = await db.brandVoice.findUnique({
    where: { orgId: proposal.orgId },
  });

  // Fetch KB items for context
  const kbItems =
    kbItemIds.length > 0
      ? await db.knowledgeBaseItem.findMany({
          where: {
            id: { in: kbItemIds },
            orgId: proposal.orgId,
            isActive: true,
          },
          select: { id: true, title: true, content: true, type: true },
        })
      : [];

  const brandVoiceText = brandVoice
    ? formatBrandVoice(brandVoice)
    : "Professional, clear, and concise. Use active voice and first-person plural.";

  const kbContext =
    kbItems.length > 0
      ? kbItems
          .map(
            (item) =>
              `[KB Item ID: ${item.id}]\nType: ${item.type}\nTitle: ${item.title}\n\n${item.content}`,
          )
          .join("\n\n---\n\n")
      : "No knowledge base context available.";

  const requirementsText = requirementTexts
    .map((req, i) => `${i + 1}. ${req}`)
    .join("\n");

  // Load versioned prompt
  const prompt = loadPrompt("section-generator");

  const userMessage = renderPrompt(prompt.userTemplate, {
    proposal_title: proposal.title,
    section_title: sectionTitle,
    requirements: requirementsText,
    brand_voice: brandVoiceText,
    kb_context: kbContext,
    instructions: instructions || "None.",
  });

  logger.info("generateSection.start", {
    proposalId,
    sectionTitle,
    requirementCount: requirementTexts.length,
    kbItemCount: kbItems.length,
  });

  const result = await executeWithFallback(
    {
      promptId: "section-generator",
      promptVersion: prompt.metadata.version,
      systemMessage: prompt.systemMessage,
      userMessage,
      maxTokens: prompt.metadata.max_tokens,
      temperature: prompt.metadata.temperature,
    },
    SectionGeneratorOutputSchema,
    kbContext,
  );

  logger.info("generateSection.complete", {
    proposalId,
    sectionTitle,
    confidenceScore: result.data.confidence_score,
    model: result.metadata.model,
    costUsd: result.metadata.usage.cost,
  });

  return { output: result.data, metadata: result.metadata };
}

// ── Private ────────────────────────────────────────────────────────────────

function formatBrandVoice(
  bv: NonNullable<Awaited<ReturnType<typeof db.brandVoice.findUnique>>>,
): string {
  const style = bv.style as Record<string, unknown> | null;
  const terminology = bv.terminology as Record<string, unknown> | null;

  const lines: string[] = [`Tone: ${bv.tone}`];

  if (style) {
    lines.push(`Style: ${JSON.stringify(style)}`);
  }
  if (terminology && typeof terminology === "object") {
    const preferred = Array.isArray(terminology.preferred_terms)
      ? (terminology.preferred_terms as string[]).join(", ")
      : "";
    if (preferred) lines.push(`Preferred terminology: ${preferred}`);
  }

  return lines.join("\n");
}

// Re-export schema for use in streaming route
export { SectionGeneratorOutputSchema };
export type { SectionGeneratorOutput };
export { z };
