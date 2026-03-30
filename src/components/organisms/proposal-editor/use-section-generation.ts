"use client";

// useSectionGeneration — React hook that manages the streaming AI generation
// lifecycle for a single proposal section.

import { useCallback, useRef, useState } from "react";
import { markdownToHtml } from "./markdown-to-html";
import type { GenerateContext } from "./types";
import {
  SectionGeneratorOutputSchema,
  type SectionGeneratorOutput,
} from "@/lib/ai/validators/section-generator-output";

export interface SectionGenerationState {
  isGenerating: boolean;
  streamBuffer: string;
  error: string | null;
}

export interface UseSectionGenerationReturn extends SectionGenerationState {
  start: () => Promise<void>;
  cancel: () => void;
  clearError: () => void;
}

interface UseSectionGenerationParams {
  sectionId: string;
  sectionTitle: string;
  generateContext: GenerateContext;
  onComplete: (html: string, output: SectionGeneratorOutput) => void;
}

export function useSectionGeneration({
  sectionId,
  sectionTitle,
  generateContext,
  onComplete,
}: UseSectionGenerationParams): UseSectionGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  void sectionId; // used by caller for identification

  const start = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setStreamBuffer("");

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/stream-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          proposalId: generateContext.proposalId,
          sectionTitle,
          requirements: generateContext.requirements,
          kbItemIds: generateContext.kbItemIds,
          instructions: generateContext.instructions ?? "",
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep last (potentially incomplete) line in buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;

          try {
            const parsed = JSON.parse(payload) as unknown;

            if (
              typeof parsed === "object" &&
              parsed !== null &&
              "delta" in parsed &&
              typeof (parsed as { delta: unknown }).delta === "string"
            ) {
              setStreamBuffer(
                (prev) => prev + (parsed as { delta: string }).delta,
              );
            } else if (
              typeof parsed === "object" &&
              parsed !== null &&
              "content" in parsed
            ) {
              const validated = SectionGeneratorOutputSchema.safeParse(parsed);
              if (!validated.success) {
                throw new Error("AI output failed validation");
              }
              onComplete(
                markdownToHtml(validated.data.content),
                validated.data,
              );
            } else if (
              typeof parsed === "object" &&
              parsed !== null &&
              "message" in parsed
            ) {
              throw new Error(String((parsed as { message: unknown }).message));
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
      setStreamBuffer("");
    }
  }, [generateContext, isGenerating, onComplete, sectionTitle]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setStreamBuffer("");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isGenerating, streamBuffer, error, start, cancel, clearError };
}
