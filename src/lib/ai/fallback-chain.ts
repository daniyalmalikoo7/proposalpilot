// Fallback chain — primary model → lighter model → graceful error.
// Implements CLAUDE.md AI/GenAI Invariants #5 (retry/backoff) and #8 (model fallback).
// Provider: Google Gemini (free tier).

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z, type ZodSchema } from "zod";
import type { GenerateParams, GenerateResult } from "./providers/types";
import { calculateCost, logAICall } from "./cost-tracker";
import { runGuards } from "./guards/hallucination";
import { AIError } from "../types/errors";
import { logger } from "../logger";
import { env } from "../config";

let _genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) _genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);
  return _genAI;
}

// gemini-2.5-flash: primary — confirmed working on this API key
// gemini-2.5-flash-lite: fallback — lighter, also confirmed working
const FALLBACK_CHAIN = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strip markdown code fences that Gemini sometimes wraps around JSON output.
 * Handles ```json ... ``` and ``` ... ``` variants.
 */
function extractJSON(raw: string): string {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(raw.trim());
  if (fenced?.[1]) return fenced[1].trim();
  return raw.trim();
}

async function callWithExponentialBackoff(
  model: string,
  params: GenerateParams,
  attempt: number,
): Promise<GenerateResult> {
  const t0 = Date.now();

  const genModel = getGenAI().getGenerativeModel({
    model,
    systemInstruction: params.systemMessage,
    generationConfig: {
      maxOutputTokens: params.maxTokens,
      temperature: params.temperature,
    },
  });

  const result = await genModel.generateContent({
    contents: [{ role: "user", parts: [{ text: params.userMessage }] }],
  });

  const response = result.response;
  const content = response.text();

  const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;

  const usage: GenerateResult["usage"] = {
    inputTokens,
    outputTokens,
    cost: calculateCost(model, inputTokens, outputTokens),
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
  // Gemini 2.0 Flash for all prompts; lighter model as fallback.
  const primaryModel = FALLBACK_CHAIN[0];

  const chain = [
    primaryModel,
    ...FALLBACK_CHAIN.filter((m) => m !== primaryModel),
  ] as const;

  logger.debug("[fallback-chain] executeWithFallback start", {
    promptId: params.promptId,
    chain: [...chain],
  });

  for (const model of chain) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await sleep(delay + Math.random() * 100); // jitter
        }

        logger.debug("[fallback-chain] Trying model", {
          model,
          attempt,
          promptId: params.promptId,
        });

        const result = await callWithExponentialBackoff(model, params, attempt);
        logAICall(result, params.promptId);

        logger.debug("[fallback-chain] Model responded", {
          model,
          preview: result.content.slice(0, 120).replace(/\n/g, " "),
        });

        // Strip markdown fences BEFORE guards so json_validity sees clean JSON
        const jsonText = extractJSON(result.content);

        // Hallucination guards (run on fence-stripped content)
        const guardResult = await runGuards(jsonText, context);
        if (guardResult.blocked) {
          logger.debug("[fallback-chain] Guard blocked model", {
            model,
            failures: guardResult.failures,
          });
          logger.warn("Trying next model after guard block", {
            model,
            failures: guardResult.failures,
          });
          break; // move to next model
        }

        // Schema validation
        let parsed: unknown;
        try {
          const raw = JSON.parse(jsonText) as unknown;
          const validated = schema.safeParse(raw);
          if (!validated.success) {
            logger.debug("[fallback-chain] Schema validation FAILED", {
              model,
              errors: validated.error.issues.map((i) => i.message),
            });
            logger.warn("AI output failed schema validation", {
              model,
              promptId: params.promptId,
              errors: validated.error.issues.map((i) => i.message),
            });
            break; // move to next model in chain
          }
          parsed = validated.data;
        } catch (parseErr) {
          logger.debug("[fallback-chain] JSON parse FAILED", {
            model,
            error: parseErr instanceof Error ? parseErr.message : String(parseErr),
            preview: result.content.slice(0, 200),
          });
          logger.warn("AI output is not valid JSON", {
            model,
            promptId: params.promptId,
            preview: result.content.slice(0, 200),
          });
          break; // move to next model in chain
        }

        logger.debug("[fallback-chain] SUCCESS", {
          model,
          promptId: params.promptId,
        });
        return { data: parsed as T, metadata: result };
      } catch (err) {
        const isLastAttempt = attempt === MAX_RETRIES;
        logger.debug("[fallback-chain] API call FAILED", {
          model,
          attempt,
          isLastAttempt,
          error: err instanceof Error ? err.message.slice(0, 200) : String(err),
        });
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
