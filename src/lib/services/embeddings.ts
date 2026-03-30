// Embeddings service — vector upsert and pgvector cosine similarity search.
// Embedding generation is delegated to an EmbeddingProvider (default: Voyage AI).
// pgvector operations use Prisma $executeRawUnsafe / $queryRawUnsafe with
// validated numeric inputs — there is no user-supplied data in the SQL.

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

// ── Voyage AI provider (recommended for Claude-based apps) ────────────────────
// Install voyageai: npm install voyageai
// Set VOYAGE_API_KEY in .env
//
// Swap this implementation for any provider that matches the interface.

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 1024; // voyage-large-2 / voyage-2

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
      body: JSON.stringify({
        model: "voyage-large-2",
        input: text,
      }),
    });

    if (!response.ok) {
      throw new AppError(
        `Voyage AI embedding request failed: ${response.statusText}`,
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
      body: JSON.stringify({
        model: "voyage-large-2",
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new AppError(
        `Voyage AI batch embedding failed: ${response.statusText}`,
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

// ── pgvector operations ────────────────────────────────────────────────────────

/**
 * Upsert the embedding vector for a KnowledgeBaseItem row.
 * Uses parameterized raw SQL — the vector string is constructed from a
 * validated numeric array, not from user input.
 */
export async function upsertEmbedding(
  db: PrismaClient,
  itemId: string,
  text: string,
  provider: EmbeddingProvider,
): Promise<void> {
  const vector = await provider.embed(text);
  validateVector(vector, provider.dimensions);

  const vectorLiteral = `[${vector.join(",")}]`;

  await db.$executeRawUnsafe(
    `UPDATE "KnowledgeBaseItem" SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    itemId,
  );

  logger.debug("Upserted embedding", { itemId, dimensions: vector.length });
}

export interface SimilarItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isWin: boolean;
  /** Cosine similarity — 1.0 is identical, 0.0 is orthogonal */
  similarity: number;
}

/**
 * Semantic search within an organisation's knowledge base using pgvector
 * cosine distance (<=>).  Results are scoped to the org — tenant isolation.
 */
export async function searchSimilar(
  db: PrismaClient,
  orgId: string,
  queryEmbedding: number[],
  options: { limit?: number; minSimilarity?: number } = {},
): Promise<SimilarItem[]> {
  const limit = options.limit ?? 5;
  const minSim = options.minSimilarity ?? 0.5;

  validateVector(queryEmbedding);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const rows = await db.$queryRawUnsafe<SimilarItem[]>(
    `
    SELECT
      id, title, content, type, "isWin",
      1 - (embedding <=> $1::vector) AS similarity
    FROM "KnowledgeBaseItem"
    WHERE "orgId" = $2
      AND embedding IS NOT NULL
      AND 1 - (embedding <=> $1::vector) >= $3
    ORDER BY embedding <=> $1::vector
    LIMIT $4
    `,
    vectorLiteral,
    orgId,
    minSim,
    limit,
  );

  logger.debug("Vector search complete", {
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
