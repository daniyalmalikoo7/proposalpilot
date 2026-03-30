import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

const KnowledgeBaseItemTypeSchema = z.enum([
  "CASE_STUDY",
  "PAST_PROPOSAL",
  "METHODOLOGY",
  "TEAM_BIO",
  "PRICING",
  "CERTIFICATE",
  "OTHER",
]);

export const kbRouter = router({
  /**
   * Upload and index a knowledge base item.
   * File upload is handled by a separate multipart endpoint;
   * this procedure creates the DB record after storage.
   */
  create: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        type: KnowledgeBaseItemTypeSchema,
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        fileUrl: z.string().url().optional(),
        metadata: z.record(z.unknown()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.knowledgeBaseItem.create({
        data: {
          orgId: input.orgId,
          type: input.type,
          title: input.title,
          content: input.content,
          fileUrl: input.fileUrl,
          // Zod validates input structure; cast is safe validated narrowing
          metadata: input.metadata as Prisma.InputJsonValue,
        },
      });
    }),

  /**
   * List knowledge base items for an organization.
   */
  list: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        type: KnowledgeBaseItemTypeSchema.optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.knowledgeBaseItem.findMany({
        where: {
          orgId: input.orgId,
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
          metadata: true,
          createdAt: true,
          updatedAt: true,
          // Omit content and embedding from list view for performance
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
   * Embedding computation is handled by the AI pipeline service.
   */
  search: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        query: z.string().min(1).max(1000),
        type: KnowledgeBaseItemTypeSchema.optional(),
        limit: z.number().int().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: compute query embedding via AI pipeline, then use pgvector cosine similarity
      // For now, fall back to full-text search
      const items = await ctx.db.knowledgeBaseItem.findMany({
        where: {
          orgId: input.orgId,
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

      return items;
    }),

  /**
   * Soft-delete a knowledge base item.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid(), orgId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.knowledgeBaseItem.findFirst({
        where: { id: input.id, orgId: input.orgId },
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
