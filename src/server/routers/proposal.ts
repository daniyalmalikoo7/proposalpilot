import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, orgProtectedProcedure } from "@/server/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { exportProposal } from "@/lib/services/export-service";

const ProposalStatusSchema = z.enum([
  "DRAFT",
  "IN_PROGRESS",
  "REVIEW",
  "SUBMITTED",
  "WON",
  "LOST",
  "ARCHIVED",
]);

export const proposalRouter = router({
  /**
   * Create a new proposal. The org is derived from the Clerk session (ctx.internalOrgId).
   */
  create: orgProtectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        clientName: z.string().max(255).optional(),
        deadline: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert User record — auto-provisions on first request after Clerk sign-up.
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(ctx.clerkUserId);
      const email =
        clerkUser.emailAddresses[0]?.emailAddress ??
        `${ctx.clerkUserId}@placeholder.local`;

      const user = await ctx.db.user.upsert({
        where: { clerkId: ctx.clerkUserId },
        create: { clerkId: ctx.clerkUserId, email, orgId: ctx.internalOrgId },
        update: {},
        select: { id: true },
      });

      return ctx.db.proposal.create({
        data: {
          title: input.title,
          clientName: input.clientName,
          deadline: input.deadline ? new Date(input.deadline) : null,
          orgId: ctx.internalOrgId,
          userId: user.id,
          status: "DRAFT",
        },
      });
    }),

  /**
   * List proposals for the authenticated org — pipeline view.
   */
  list: orgProtectedProcedure
    .input(
      z.object({
        status: ProposalStatusSchema.optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.proposal.findMany({
        where: {
          orgId: ctx.internalOrgId,
          ...(input.status ? { status: input.status } : {}),
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        select: {
          id: true,
          title: true,
          clientName: true,
          status: true,
          deadline: true,
          createdAt: true,
          updatedAt: true,
          sections: { select: { content: true } },
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
   * Fetch a single proposal with all relations.
   */
  get: orgProtectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.id, orgId: ctx.internalOrgId },
        include: {
          rfpSource: true,
          requirements: { orderBy: { id: "asc" } },
          sections: { orderBy: { order: "asc" } },
          complianceMatrix: true,
          winLoss: true,
        },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      return proposal;
    }),

  /**
   * Create a new blank section for a proposal.
   * Called before AI generation when no sections exist yet.
   */
  createSection: orgProtectedProcedure
    .input(
      z.object({
        proposalId: z.string().cuid(),
        title: z.string().min(1).max(255),
        order: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.proposalId, orgId: ctx.internalOrgId },
        select: { id: true },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      return ctx.db.proposalSection.create({
        data: {
          proposalId: input.proposalId,
          title: input.title,
          content: "",
          order: input.order,
          confidenceScore: 0,
        },
      });
    }),

  /**
   * Update a proposal section's content.
   */
  updateSection: orgProtectedProcedure
    .input(
      z.object({
        sectionId: z.string().cuid(),
        proposalId: z.string().cuid(),
        content: z.string(),
        title: z.string().min(1).max(255).optional(),
        // Written only when generation completes; omitted on plain content edits
        // so manual edits never reset the AI-assigned confidence value.
        confidenceScore: z.number().min(0).max(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.proposalId, orgId: ctx.internalOrgId },
        select: { id: true },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      return ctx.db.proposalSection.update({
        where: { id: input.sectionId, proposalId: input.proposalId },
        data: {
          content: input.content,
          ...(input.title ? { title: input.title } : {}),
          ...(input.confidenceScore !== undefined
            ? { confidenceScore: input.confidenceScore }
            : {}),
          updatedAt: new Date(),
        },
      });
    }),

  /**
   * Export a proposal as PDF or DOCX (returns a base64 data URL).
   */
  export: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        format: z.enum(["pdf", "docx"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.id, orgId: ctx.internalOrgId },
        include: {
          sections: {
            orderBy: { order: "asc" },
            select: { order: true, title: true, content: true },
          },
        },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      const result = await exportProposal(
        {
          title: proposal.title,
          clientName: proposal.clientName,
          sections: proposal.sections,
        },
        input.format,
      );

      const dataUrl = `data:${result.mimeType};base64,${result.buffer.toString("base64")}`;

      return {
        downloadUrl: dataUrl,
        filename: result.filename,
        format: input.format,
      };
    }),

  /**
   * Mark a proposal as won or lost.
   */
  setOutcome: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        outcome: z.enum(["WON", "LOST"]),
        feedback: z.string().optional(),
        dealValue: z.number().positive().optional(),
        competitor: z.string().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.id, orgId: ctx.internalOrgId },
        select: { id: true },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      const [updated] = await ctx.db.$transaction([
        ctx.db.proposal.update({
          where: { id: input.id },
          data: { status: input.outcome },
        }),
        ctx.db.winLossRecord.upsert({
          where: { proposalId: input.id },
          create: {
            proposalId: input.id,
            outcome: input.outcome,
            feedback: input.feedback,
            dealValue: input.dealValue,
            competitor: input.competitor,
            decidedAt: new Date(),
          },
          update: {
            outcome: input.outcome,
            feedback: input.feedback,
            dealValue: input.dealValue,
            competitor: input.competitor,
            decidedAt: new Date(),
          },
        }),
      ]);

      return updated;
    }),
});
