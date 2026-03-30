// AI cost tracking — log every model call with token counts and USD cost.
// See CLAUDE.md AI/GenAI Invariant #6.

import type { GenerateResult } from "./providers/types";
import { logger } from "../logger";

// Per-token costs in USD as of 2025-03 — update when pricing changes
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": {
    input: 0.8 / 1_000_000,
    output: 4.0 / 1_000_000,
  },
  "claude-sonnet-4-6": {
    input: 3.0 / 1_000_000,
    output: 15.0 / 1_000_000,
  },
  "claude-opus-4-6": {
    input: 15.0 / 1_000_000,
    output: 75.0 / 1_000_000,
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
