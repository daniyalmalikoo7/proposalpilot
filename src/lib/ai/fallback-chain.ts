// Fallback chain — primary model → haiku → graceful error.
// Implements CLAUDE.md AI/GenAI Invariants #5 (retry/backoff) and #8 (model fallback).

import Anthropic from "@anthropic-ai/sdk";
import { z, type ZodSchema } from "zod";
import type { GenerateParams, GenerateResult } from "./providers/types";
import { calculateCost, logAICall } from "./cost-tracker";
import { runGuards } from "./guards/hallucination";
import { AIError } from "../types/errors";
import { logger } from "../logger";
import { env } from "../config";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// ADR-004: Sonnet for generation, Haiku for extraction/classification
const FALLBACK_CHAIN = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
] as const;

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithExponentialBackoff(
  model: string,
  params: GenerateParams,
  attempt: number,
): Promise<GenerateResult> {
  const t0 = Date.now();

  const response = await client.messages.create({
    model,
    system: params.systemMessage,
    messages: [{ role: "user", content: params.userMessage }],
    max_tokens: params.maxTokens,
    temperature: params.temperature,
  });

  const content =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  const usage: GenerateResult["usage"] = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cost: calculateCost(
      model,
      response.usage.input_tokens,
      response.usage.output_tokens,
    ),
  };

  void attempt; // used only for logging context

  return {
    content,
    usage,
    latencyMs: Date.now() - t0,
    model,
    cached: false,
  };
}

/**
 * Execute an AI call with schema validation, hallucination guards, and a
 * model fallback chain.  Returns the validated, parsed result or throws AIError.
 */
export async function executeWithFallback<T>(
  params: GenerateParams,
  schema: ZodSchema<T>,
  context = "",
): Promise<{ data: T; metadata: GenerateResult }> {
  const modelForPrompt = params.promptVersion
    ? FALLBACK_CHAIN[0]
    : FALLBACK_CHAIN[0];

  // Determine which model to try first based on promptId convention:
  // prompts prefixed with "requirement-extractor" use Haiku; others use Sonnet.
  const primaryModel = params.promptId.includes("extractor")
    ? "claude-haiku-4-5-20251001"
    : modelForPrompt;

  const chain = [
    primaryModel,
    ...FALLBACK_CHAIN.filter((m) => m !== primaryModel),
  ] as const;

  for (const model of chain) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await sleep(delay + Math.random() * 100); // jitter
        }

        const result = await callWithExponentialBackoff(model, params, attempt);
        logAICall(result, params.promptId);

        // Hallucination guards
        const guardResult = await runGuards(result.content, context);
        if (guardResult.blocked) {
          logger.warn("Trying next model after guard block", {
            model,
            failures: guardResult.failures,
          });
          break; // move to next model
        }

        // Schema validation
        let parsed: unknown;
        try {
          const raw = JSON.parse(result.content) as unknown;
          const validated = schema.safeParse(raw);
          if (!validated.success) {
            logger.warn("AI output failed schema validation", {
              model,
              promptId: params.promptId,
              errors: validated.error.issues.map((i) => i.message),
            });
            break; // move to next model
          }
          parsed = validated.data;
        } catch {
          logger.warn("AI output is not valid JSON", {
            model,
            promptId: params.promptId,
          });
          break; // move to next model
        }

        return { data: parsed as T, metadata: result };
      } catch (err) {
        const isLastAttempt = attempt === MAX_RETRIES;
        logger.error("AI call failed", {
          model,
          attempt,
          promptId: params.promptId,
          error: err instanceof Error ? err.message : String(err),
        });
        if (isLastAttempt) break; // exhaust retries → next model
      }
    }
  }

  throw new AIError("All models in fallback chain exhausted", {
    promptId: params.promptId,
    chain: [...chain],
  });
}

// Re-export for convenience
export { z };
