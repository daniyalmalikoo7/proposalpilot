import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

export const aiRouter = router({
  /**
   * Parse an RFP document into structured requirements.
   * Uses Claude Haiku for cost-efficient extraction.
   */
  extractRequirements: protectedProcedure
    .input(
      z.object({
        proposalId: z.string().cuid(),
        orgId: z.string().cuid(),
        rfpText: z.string().min(100).max(200_000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

      // TODO: invoke AI pipeline — ExtractRequirementsService
      // Returns: { requirements: ExtractedRequirement[] }
      return { requirements: [], proposalId: input.proposalId };
    }),

  /**
   * Find relevant knowledge base items for a given requirement.
   * Uses pgvector similarity search.
   */
  matchContent: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        requirementId: z.string().cuid(),
        requirementText: z.string().min(1).max(5000),
        topK: z.number().int().min(1).max(10).default(3),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify org access
      const requirement = await ctx.db.extractedRequirement.findFirst({
        where: {
          id: input.requirementId,
          proposal: { orgId: input.orgId },
        },
        select: { id: true },
      });

      if (!requirement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Requirement not found.",
        });
      }

      // TODO: embed requirementText → pgvector cosine similarity search
      return { matches: [], requirementId: input.requirementId };
    }),

  /**
   * Generate a draft for a proposal section using Claude Sonnet.
   */
  generateSection: protectedProcedure
    .input(
      z.object({
        proposalId: z.string().cuid(),
        orgId: z.string().cuid(),
        sectionTitle: z.string().min(1).max(255),
        requirements: z.array(z.string()).max(20),
        kbItemIds: z.array(z.string().cuid()).max(10).default([]),
        instructions: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.proposalId, orgId: input.orgId },
        select: { id: true, title: true },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      // TODO: invoke GenerateSectionService (Sonnet model)
      return {
        content: "",
        confidenceScore: 0,
        citedKbItemIds: [] as string[],
        proposalId: input.proposalId,
      };
    }),

  /**
   * Analyze brand voice from uploaded proposal examples.
   */
  analyzeBrandVoice: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        sampleTexts: z.array(z.string().min(100)).min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify org
      const org = await ctx.db.organization.findUnique({
        where: { id: input.orgId },
        select: { id: true },
      });

      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Org not found." });
      }

      // TODO: invoke BrandVoiceAnalysisService (Opus model)
      return { brandVoiceId: null as string | null, orgId: input.orgId };
    }),

  /**
   * Verify that all extracted requirements are addressed in the proposal.
   */
  checkCompliance: protectedProcedure
    .input(
      z.object({
        proposalId: z.string().cuid(),
        orgId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.proposalId, orgId: input.orgId },
        include: {
          requirements: true,
          sections: { select: { id: true, title: true, content: true } },
        },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      // TODO: invoke ComplianceCheckService (Haiku model)
      return {
        coverageScore: 0,
        matrix: {} as Record<string, unknown>,
        proposalId: input.proposalId,
      };
    }),
});
