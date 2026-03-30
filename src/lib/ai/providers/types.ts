// AI provider abstraction — all model calls go through this interface.
// Concrete implementations: AnthropicProvider (primary), CacheProvider (fallback).

import type { ZodTypeAny } from "zod";

export interface GenerateParams {
  promptId: string;
  promptVersion: string;
  systemMessage: string;
  userMessage: string;
  maxTokens: number;
  temperature: number;
  responseSchema?: ZodTypeAny;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  /** Estimated cost in USD */
  cost: number;
}

export interface GenerateResult {
  content: string;
  parsed?: unknown;
  usage: TokenUsage;
  latencyMs: number;
  model: string;
  cached: boolean;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

export interface AIProvider {
  generate(params: GenerateParams): Promise<GenerateResult>;
  stream(params: GenerateParams): AsyncIterable<StreamChunk>;
  /** Approximate token count for a string (4 chars ≈ 1 token) */
  countTokens(text: string): number;
}

// Model IDs — keep in sync with cost-tracker.ts
export const MODEL_IDS = {
  HAIKU: "claude-haiku-4-5-20251001",
  SONNET: "claude-sonnet-4-6",
  OPUS: "claude-opus-4-6",
} as const;

export type ModelId = (typeof MODEL_IDS)[keyof typeof MODEL_IDS];
