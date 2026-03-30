// BrandVoiceAnalysisService — extracts brand voice profile from sample texts.
// Uses Gemini 2.0 Flash via executeWithFallback.

import { loadPrompt, renderPrompt } from "@/lib/ai/prompts/base";
import { executeWithFallback } from "@/lib/ai/fallback-chain";
import { BrandVoiceOutputSchema } from "@/lib/ai/validators/brand-voice-output";
import type { BrandVoiceOutput } from "@/lib/ai/validators/brand-voice-output";
import type { GenerateResult } from "@/lib/ai/providers/types";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { type Prisma } from "@prisma/client";

export interface AnalyzeBrandVoiceParams {
  orgId: string;
  sampleTexts: string[];
}

export interface AnalyzeBrandVoiceResult {
  brandVoiceId: string;
  output: BrandVoiceOutput;
  metadata: GenerateResult;
}

/**
 * Analyse sample proposal texts to extract brand voice, then upsert the
 * BrandVoice record for the organisation.
 */
export async function analyzeBrandVoice(
  params: AnalyzeBrandVoiceParams,
): Promise<AnalyzeBrandVoiceResult> {
  const { orgId, sampleTexts } = params;

  const samplesBlock = sampleTexts
    .map((text, i) => `## Sample ${i + 1}\n\n${text}`)
    .join("\n\n---\n\n");

  const prompt = loadPrompt("brand-voice-analyzer");

  const userMessage = renderPrompt(prompt.userTemplate, {
    sample_count: String(sampleTexts.length),
    samples: samplesBlock,
  });

  logger.info("analyzeBrandVoice.start", {
    orgId,
    sampleCount: sampleTexts.length,
  });

  // Opus is the primary model for brand voice analysis (ADR-004).
  // Override the fallback chain default by prepending Opus to prompt params.
  const result = await executeWithFallback(
    {
      promptId: "brand-voice-analyzer",
      promptVersion: prompt.metadata.version,
      systemMessage: prompt.systemMessage,
      userMessage,
      maxTokens: prompt.metadata.max_tokens,
      temperature: prompt.metadata.temperature,
    },
    BrandVoiceOutputSchema,
  );

  const brandVoice = await db.brandVoice.upsert({
    where: { orgId },
    create: {
      orgId,
      tone: result.data.tone,
      style: result.data.style as Prisma.InputJsonValue,
      terminology: result.data.terminology as Prisma.InputJsonValue,
      analyzedAt: new Date(),
    },
    update: {
      tone: result.data.tone,
      style: result.data.style as Prisma.InputJsonValue,
      terminology: result.data.terminology as Prisma.InputJsonValue,
      analyzedAt: new Date(),
    },
  });

  logger.info("analyzeBrandVoice.complete", {
    orgId,
    brandVoiceId: brandVoice.id,
    model: result.metadata.model,
    costUsd: result.metadata.usage.cost,
  });

  return {
    brandVoiceId: brandVoice.id,
    output: result.data,
    metadata: result.metadata,
  };
}
