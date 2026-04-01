import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { router, orgProtectedProcedure } from "@/server/trpc";
import {
  VoyageEmbeddingProvider,
  upsertEmbedding,
  searchSimilar,
} from "@/lib/services/embeddings";
import { logger } from "@/lib/logger";

const voyageProvider = new VoyageEmbeddingProvider();

const KnowledgeBaseItemTypeSchema = z.enum([
  "CASE_STUDY",
  "PAST_PROPOSAL",
  "METHODOLOGY",
  "TEAM_BIO",
  "CAPABILITY",
  "PRICING",
  "CERTIFICATE",
  "OTHER",
]);

export const kbRouter = router({
  /**
   * Upload and index a knowledge base item.
   * Creates the DB record then asynchronously generates and stores the embedding.
   */
  create: orgProtectedProcedure
    .input(
      z.object({
        type: KnowledgeBaseItemTypeSchema,
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        fileUrl: z.string().url().optional(),
        metadata: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.knowledgeBaseItem.create({
        data: {
          orgId: ctx.internalOrgId,
          type: input.type,
          title: input.title,
          content: input.content,
          fileUrl: input.fileUrl,
          metadata: input.metadata as Prisma.InputJsonValue,
        },
      });

      // Generate and persist embedding — non-fatal: item is usable without it
      const embeddingText = `${input.title}\n\n${input.content}`;
      upsertEmbedding(ctx.db, item.id, embeddingText, voyageProvider).catch(
        (err: unknown) => {
          logger.warn(
            "Failed to generate KB embedding — item saved without vector",
            {
              itemId: item.id,
              error: err instanceof Error ? err.message : String(err),
            },
          );
        },
      );

      return item;
    }),

  /**
   * List knowledge base items for the authenticated org.
   */
  list: orgProtectedProcedure
    .input(
      z.object({
        type: KnowledgeBaseItemTypeSchema.optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.knowledgeBaseItem.findMany({
        where: {
          orgId: ctx.internalOrgId,
          isActive: true,
          ...(input.type ? { type: input.type } : {}),
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        select: {
          id: true,
          type: true,
          title: true,
          fileUrl: true,
          isWin: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  /**
   * Semantic search over the knowledge base using pgvector.
   * Falls back to full-text search if embedding is unavailable.
   */
  search: orgProtectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(1000),
        type: KnowledgeBaseItemTypeSchema.optional(),
        limit: z.number().int().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const queryEmbedding = await voyageProvider.embed(input.query);
        const results = await searchSimilar(
          ctx.db,
          ctx.internalOrgId,
          queryEmbedding,
          { limit: input.limit },
        );

        const filtered = input.type
          ? results.filter((r) => r.type === input.type)
          : results;

        logger.debug("KB semantic search complete", {
          orgId: ctx.internalOrgId,
          resultCount: filtered.length,
        });

        return filtered.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          content: r.content,
          similarity: r.similarity,
          metadata: {} as Record<string, unknown>,
        }));
      } catch (err) {
        logger.warn("Falling back to full-text KB search", {
          orgId: ctx.internalOrgId,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      // Full-text fallback
      const items = await ctx.db.knowledgeBaseItem.findMany({
        where: {
          orgId: ctx.internalOrgId,
          isActive: true,
          ...(input.type ? { type: input.type } : {}),
          OR: [
            { title: { contains: input.query, mode: "insensitive" } },
            { content: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
        select: {
          id: true,
          type: true,
          title: true,
          content: true,
          metadata: true,
        },
      });

      return items.map((item) => ({
        ...item,
        similarity: null as number | null,
        metadata: item.metadata as Record<string, unknown>,
      }));
    }),

  /**
   * Soft-delete a knowledge base item.
   */
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.knowledgeBaseItem.findFirst({
        where: { id: input.id, orgId: ctx.internalOrgId },
        select: { id: true },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Knowledge base item not found.",
        });
      }

      return ctx.db.knowledgeBaseItem.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),
});
