// AI cost tracking — log every model call with token counts and USD cost.
// See CLAUDE.md AI/GenAI Invariant #6.

import type { GenerateResult } from "./providers/types";
import { logger } from "../logger";

// Per-token costs in USD — Gemini free tier (update when switching to paid)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "gemini-2.5-flash": {
    input: 0,
    output: 0,
  },
  "gemini-2.5-flash-lite": {
    input: 0,
    output: 0,
  },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const rates = MODEL_COSTS[model];
  if (!rates) {
    logger.warn("Unknown model — cost tracking unavailable", { model });
    return 0;
  }
  return inputTokens * rates.input + outputTokens * rates.output;
}

export function logAICall(result: GenerateResult, promptId: string): void {
  logger.info("ai_call", {
    promptId,
    model: result.model,
    inputTokens: result.usage.inputTokens,
    outputTokens: result.usage.outputTokens,
    costUsd: result.usage.cost.toFixed(6),
    latencyMs: result.latencyMs,
    cached: result.cached,
  });
}

/**
 * Guard against accidental cost overruns by checking the estimated cost of a
 * single call before sending it.  Throws if it would exceed the per-request cap.
 */
export function assertWithinCostBudget(
  model: string,
  estimatedInputTokens: number,
  perRequestLimitUsd = 0.1,
): void {
  const rates = MODEL_COSTS[model];
  if (!rates) return;

  // Conservative estimate: assume 1:1 output ratio
  const estimated = estimatedInputTokens * (rates.input + rates.output);
  if (estimated > perRequestLimitUsd) {
    throw new Error(
      `Estimated cost $${estimated.toFixed(4)} exceeds per-request budget ` +
        `$${perRequestLimitUsd.toFixed(4)} for model ${model}. ` +
        `Reduce context or increase the budget explicitly.`,
    );
  }
}
