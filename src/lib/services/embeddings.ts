// Embeddings service — vector upsert and pgvector cosine similarity search.
// Embedding generation is delegated to an EmbeddingProvider (default: Voyage AI).
// pgvector operations use Prisma $executeRawUnsafe / $queryRawUnsafe with
// validated numeric inputs — there is no user-supplied data in the SQL.
//
// Architecture: per-chunk embeddings.
//   - KbChunk rows hold individual vector(1024) embeddings.
//   - searchSimilar queries KbChunk, aggregates best similarity per parent
//     KnowledgeBaseItem, and returns document-level results.
//   - Callers never see chunk internals — the SimilarItem shape is unchanged.

import { PrismaClient } from "@prisma/client";
import { logger } from "../logger";
import { AppError } from "../types/errors";
import { env } from "../config";

// ── Provider interface ─────────────────────────────────────────────────────────

export interface EmbeddingProvider {
  /** Dimensionality of the vectors this provider produces */
  readonly dimensions: number;
  /** Embed a single text string and return the vector */
  embed(text: string): Promise<number[]>;
  /** Batch embed multiple strings efficiently */
  embedBatch(texts: string[]): Promise<number[][]>;
}

// ── Voyage AI provider ────────────────────────────────────────────────────────
// Uses raw fetch — no voyageai SDK dependency required.
// Set VOYAGE_API_KEY in .env. Falls back gracefully if unset (full-text search).

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 1024; // voyage-3

  async embed(text: string): Promise<number[]> {
    const key = env.VOYAGE_API_KEY;
    if (!key) {
      throw new AppError(
        "VOYAGE_API_KEY is not set. Configure an embedding provider.",
        "EMBEDDING_CONFIG_ERROR",
      );
    }

    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      // input_type: 'query' tells Voyage to optimize the vector for retrieval
      // (asymmetric search). Documents are stored with input_type: 'document'.
      body: JSON.stringify({
        model: "voyage-3",
        input: text,
        input_type: "query",
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new AppError(
        `Voyage AI embedding request failed: ${response.status} ${response.statusText} — ${body}`,
        "EMBEDDING_API_ERROR",
        { status: response.status },
      );
    }

    const json = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
    };
    const embedding = json.data[0]?.embedding;

    if (!embedding) {
      throw new AppError(
        "Voyage AI returned no embedding",
        "EMBEDDING_API_ERROR",
      );
    }

    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const key = env.VOYAGE_API_KEY;
    if (!key) {
      throw new AppError(
        "VOYAGE_API_KEY is not set.",
        "EMBEDDING_CONFIG_ERROR",
      );
    }

    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      // input_type: 'document' optimizes vectors for being retrieved (stored side).
      body: JSON.stringify({
        model: "voyage-3",
        input: texts,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new AppError(
        `Voyage AI batch embedding failed: ${response.status} ${response.statusText} — ${body}`,
        "EMBEDDING_API_ERROR",
        { status: response.status },
      );
    }

    const json = (await response.json()) as {
      data: Array<{ index: number; embedding: number[] }>;
    };

    // Results may arrive out of order — sort by index
    const sorted = [...json.data].sort((a, b) => a.index - b.index);
    return sorted.map((d) => d.embedding);
  }
}

// ── KbChunk vector operations ─────────────────────────────────────────────────

/**
 * Persist a pre-computed embedding vector for a single KbChunk row.
 * The vector string is constructed from a validated numeric array —
 * no user-supplied data is interpolated into the SQL.
 */
export async function upsertChunkEmbeddingVector(
  db: PrismaClient,
  chunkId: string,
  vector: number[],
): Promise<void> {
  validateVector(vector);
  const vectorLiteral = `[${vector.join(",")}]`;

  await db.$executeRawUnsafe(
    `UPDATE "KbChunk" SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    chunkId,
  );

  logger.debug("Upserted chunk embedding", {
    chunkId,
    dimensions: vector.length,
  });
}

// Max texts per Voyage AI embedBatch call. Voyage free tier is 10K TPM;
// a 500-token chunk × 20 = 10K tokens per batch, staying within limits.
const EMBED_BATCH_SIZE = 20;

/**
 * Batch-embed an array of chunks and persist their vectors.
 * Splits into sub-batches of EMBED_BATCH_SIZE to avoid Voyage AI TPM quota
 * failures when ingesting large documents (previously sent all at once).
 */
export async function embedAndStoreChunks(
  db: PrismaClient,
  chunks: ReadonlyArray<{ id: string; text: string }>,
  provider: EmbeddingProvider,
): Promise<void> {
  if (chunks.length === 0) return;

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const texts = batch.map((c) => c.text);
    const vectors = await provider.embedBatch(texts);

    await Promise.all(
      vectors.map((vector, j) => {
        const chunk = batch[j];
        if (!chunk) return Promise.resolve();
        return upsertChunkEmbeddingVector(db, chunk.id, vector);
      }),
    );

    logger.debug("Batch chunk embeddings stored", {
      batchStart: i,
      batchSize: batch.length,
      totalChunks: chunks.length,
    });
  }
}

// ── Semantic search ────────────────────────────────────────────────────────────

export interface SimilarItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isWin: boolean;
  /** Best cosine similarity across all chunks of this document (0–1, higher = more relevant) */
  similarity: number;
}

/**
 * Semantic search within an organisation's knowledge base.
 *
 * Queries KbChunk vectors using pgvector cosine distance, then aggregates
 * to document level (MIN distance = MAX similarity per KnowledgeBaseItem).
 * Results are scoped to active items in the org — tenant isolation guaranteed.
 *
 * Falls back to returning [] if no chunks have embeddings yet;
 * callers should implement a full-text fallback.
 */
export async function searchSimilar(
  db: PrismaClient,
  orgId: string,
  queryEmbedding: number[],
  options: { limit?: number; minSimilarity?: number } = {},
): Promise<SimilarItem[]> {
  const limit = options.limit ?? 5;
  // 0.3 is intentionally lenient: surface cross-domain KB content that is
  // directionally relevant. Callers that need tighter relevance can pass a
  // higher value. The previous default of 0.5 was filtering out valid results
  // for queries whose domain differed slightly from the stored documents
  // (e.g. cloud-migration query against a case-study corpus scored 0.46).
  const minSim = options.minSimilarity ?? 0.3;

  validateVector(queryEmbedding);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  // $1 = query vector, $2 = orgId, $3 = minSimilarity threshold, $4 = limit
  // MIN(distance) across chunks = MAX(similarity) for the document.
  // The WHERE filter includes any document where at least one chunk exceeds the threshold.
  const rows = await db.$queryRawUnsafe<SimilarItem[]>(
    `
    SELECT
      kbi.id,
      kbi.title,
      kbi.content,
      kbi.type,
      kbi."isWin",
      1 - MIN(c.embedding <=> $1::vector) AS similarity
    FROM "KbChunk" c
    JOIN "KnowledgeBaseItem" kbi ON kbi.id = c."itemId"
    WHERE kbi."orgId" = $2
      AND kbi."isActive" = true
      AND c.embedding IS NOT NULL
      AND 1 - (c.embedding <=> $1::vector) >= $3
    GROUP BY kbi.id, kbi.title, kbi.content, kbi.type, kbi."isWin"
    ORDER BY similarity DESC
    LIMIT $4
    `,
    vectorLiteral,
    orgId,
    minSim,
    limit,
  );

  logger.debug("Chunk-level vector search complete", {
    orgId,
    resultCount: rows.length,
    limit,
  });

  return rows;
}

// ── Private ────────────────────────────────────────────────────────────────────

function validateVector(vector: number[], expectedDims?: number): void {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new AppError("Invalid embedding: empty vector", "EMBEDDING_INVALID");
  }
  if (expectedDims && vector.length !== expectedDims) {
    throw new AppError(
      `Embedding dimension mismatch: expected ${expectedDims}, got ${vector.length}`,
      "EMBEDDING_DIMENSION_MISMATCH",
    );
  }
  if (vector.some((v) => typeof v !== "number" || !isFinite(v))) {
    throw new AppError(
      "Invalid embedding: contains non-finite values",
      "EMBEDDING_INVALID",
    );
  }
}
