import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
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
   * Create a new proposal (without RFP — file upload handled separately).
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        clientName: z.string().max(255).optional(),
        deadline: z.string().datetime().optional(),
        orgId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.create({
        data: {
          title: input.title,
          clientName: input.clientName,
          deadline: input.deadline ? new Date(input.deadline) : null,
          orgId: input.orgId,
          userId: ctx.clerkUserId,
          status: "DRAFT",
        },
      });
      return proposal;
    }),

  /**
   * List proposals for the organization — pipeline view.
   */
  list: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        status: ProposalStatusSchema.optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.proposal.findMany({
        where: {
          orgId: input.orgId,
          ...(input.status ? { status: input.status } : {}),
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          user: { select: { id: true, email: true } },
          _count: { select: { sections: true, requirements: true } },
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
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid(), orgId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.id, orgId: input.orgId },
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
   * Update a proposal section's content.
   */
  updateSection: protectedProcedure
    .input(
      z.object({
        sectionId: z.string().cuid(),
        proposalId: z.string().cuid(),
        orgId: z.string().cuid(),
        content: z.string(),
        title: z.string().min(1).max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify org ownership before mutation
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.proposalId, orgId: input.orgId },
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
          updatedAt: new Date(),
        },
      });
    }),

  /**
   * Export a proposal as PDF or DOCX (returns a signed URL).
   */
  export: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        orgId: z.string().cuid(),
        format: z.enum(["pdf", "docx"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.id, orgId: input.orgId },
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

      // Return as base64 data URL for client-side download trigger.
      // Production path: upload to Cloudflare R2 and return signed URL.
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
  setOutcome: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        orgId: z.string().cuid(),
        outcome: z.enum(["WON", "LOST"]),
        feedback: z.string().optional(),
        dealValue: z.number().positive().optional(),
        competitor: z.string().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.id, orgId: input.orgId },
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
