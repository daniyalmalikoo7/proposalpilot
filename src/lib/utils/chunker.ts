// Text chunking utility — 500-token chunks with 50-token overlap
// Token approximation: 1 token ≈ 4 characters (cl100k_base heuristic)
// This avoids the WASM overhead of tiktoken while remaining accurate for English text.

import type { ChunkingOptions, TextChunk } from "../types/file-processing";

const CHARS_PER_TOKEN = 4;
const DEFAULT_CHUNK_TOKENS = 500;
const DEFAULT_OVERLAP_TOKENS = 50;

// Sentence/paragraph break markers — prefer longer breaks to avoid cutting mid-thought
const BREAK_PATTERNS = ["\n\n", ".\n", ". ", "! ", "? ", ";\n", ",\n", "\n"];

export function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Find the best character position to break a chunk near `targetEnd`.
 * Looks back up to `lookbackChars` characters for a natural sentence/paragraph boundary.
 */
function findBreakPoint(
  text: string,
  targetEnd: number,
  start: number,
  lookbackChars = 200,
): number {
  const searchFrom = Math.max(start, targetEnd - lookbackChars);
  const window = text.slice(searchFrom, targetEnd);

  for (const pattern of BREAK_PATTERNS) {
    const idx = window.lastIndexOf(pattern);
    if (idx !== -1) {
      return searchFrom + idx + pattern.length;
    }
  }

  return targetEnd;
}

/**
 * Split text into overlapping chunks suitable for embedding and retrieval.
 *
 * @param text - The full document text (already extracted)
 * @param options - Override default chunk/overlap token counts
 * @returns Array of TextChunk objects with positions and approximate token counts
 */
export function chunkText(
  text: string,
  options: ChunkingOptions = {},
): TextChunk[] {
  const chunkTokens = options.chunkTokens ?? DEFAULT_CHUNK_TOKENS;
  const overlapTokens = options.overlapTokens ?? DEFAULT_OVERLAP_TOKENS;

  const chunkChars = chunkTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  // Normalize line endings and collapse runs of blank lines
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (normalized.length === 0) return [];

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    const rawEnd = Math.min(start + chunkChars, normalized.length);

    // Try to break at a natural boundary if we're not at the end of the document
    const end =
      rawEnd < normalized.length
        ? findBreakPoint(normalized, rawEnd, start)
        : rawEnd;

    const chunkContent = normalized.slice(start, end).trim();

    if (chunkContent.length > 0) {
      chunks.push({
        text: chunkContent,
        index,
        tokenCount: approximateTokenCount(chunkContent),
        startChar: start,
        endChar: end,
      });
      index++;
    }

    // Advance start with overlap — always move at least 1 char to avoid infinite loop
    const nextStart = end - overlapChars;
    start = nextStart > start ? nextStart : start + 1;
  }

  return chunks;
}

/**
 * Given an array of chunks, returns the concatenated text of those whose
 * indices fall within [startIndex, endIndex). Useful for reconstructing
 * context windows from retrieval results.
 */
export function reconstructContext(
  chunks: readonly TextChunk[],
  startIndex: number,
  endIndex: number,
): string {
  return chunks
    .filter((c) => c.index >= startIndex && c.index < endIndex)
    .map((c) => c.text)
    .join("\n\n");
}
