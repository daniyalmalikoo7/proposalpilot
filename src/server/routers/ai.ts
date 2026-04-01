import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, orgProtectedProcedure } from "@/server/trpc";
import { loadPrompt, renderPrompt } from "@/lib/ai/prompts/base";
import { executeWithFallback } from "@/lib/ai/fallback-chain";
import {
  VoyageEmbeddingProvider,
  searchSimilar,
} from "@/lib/services/embeddings";
import { RequirementExtractorOutputSchema } from "@/lib/ai/validators/requirement-extractor-output";
import { SectionGeneratorOutputSchema } from "@/lib/ai/validators/section-generator-output";
import { analyzeBrandVoice as analyzeBrandVoiceService } from "@/lib/ai/services/brand-voice-analysis";
import { logger } from "@/lib/logger";

const voyageProvider = new VoyageEmbeddingProvider();

export const aiRouter = router({
  /**
   * Parse an RFP document into structured requirements.
   * Uses Claude Haiku for cost-efficient extraction (ADR-004).
   * SEC-003: orgId is derived from ctx.internalOrgId — never from client input.
   */
  extractRequirements: orgProtectedProcedure
    .input(
      z.object({
        proposalId: z.string().cuid(),
        rfpText: z.string().min(100).max(200_000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(
        `[ai.extractRequirements] called proposalId=${input.proposalId} rfpTextLen=${input.rfpText.length}`,
      );

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

      const prompt = loadPrompt("requirement-extractor");
      console.log(
        `[ai.extractRequirements] prompt loaded version=${prompt.metadata.version}`,
      );
      const userMessage = renderPrompt(prompt.userTemplate, {
        rfp_text: input.rfpText,
        document_type: "RFP",
      });

      const { data } = await executeWithFallback(
        {
          promptId: "requirement-extractor",
          promptVersion: prompt.metadata.version,
          systemMessage: prompt.systemMessage,
          userMessage,
          maxTokens: prompt.metadata.max_tokens,
          temperature: prompt.metadata.temperature,
        },
        RequirementExtractorOutputSchema,
        input.rfpText,
      );

      // Replace existing requirements for idempotent re-extraction
      await ctx.db.extractedRequirement.deleteMany({
        where: { proposalId: input.proposalId },
      });

      const requirements = await ctx.db.$transaction(
        data.requirements.map((r) =>
          ctx.db.extractedRequirement.create({
            data: {
              proposalId: input.proposalId,
              section: r.section,
              requirement: r.requirement,
              priority: r.priority,
            },
          }),
        ),
      );

      logger.info("Requirements extracted", {
        proposalId: input.proposalId,
        count: requirements.length,
        documentSummary: data.document_summary,
      });

      return {
        requirements,
        documentSummary: data.document_summary,
        sectionsFound: data.sections_found,
        proposalId: input.proposalId,
      };
    }),

  /**
   * Find relevant knowledge base items for a given requirement.
   * Embeds the requirement text and runs pgvector cosine similarity search.
   * SEC-003: orgId is derived from ctx.internalOrgId — never from client input.
   */
  matchContent: orgProtectedProcedure
    .input(
      z.object({
        requirementId: z.string().cuid(),
        requirementText: z.string().min(1).max(5000),
        topK: z.number().int().min(1).max(10).default(3),
      }),
    )
    .query(async ({ ctx, input }) => {
      const requirement = await ctx.db.extractedRequirement.findFirst({
        where: {
          id: input.requirementId,
          proposal: { orgId: ctx.internalOrgId },
        },
        select: { id: true },
      });

      if (!requirement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Requirement not found.",
        });
      }

      const queryEmbedding = await voyageProvider.embed(input.requirementText);
      const matches = await searchSimilar(
        ctx.db,
        ctx.internalOrgId,
        queryEmbedding,
        { limit: input.topK, minSimilarity: 0.5 },
      );

      return { matches, requirementId: input.requirementId };
    }),

  /**
   * Generate a draft for a proposal section using Gemini.
   * Pulls KB context and brand voice, then invokes the section-generator prompt.
   * SEC-003: orgId is derived from ctx.internalOrgId — never from client input.
   */
  generateSection: orgProtectedProcedure
    .input(
      z.object({
        proposalId: z.string().cuid(),
        sectionTitle: z.string().min(1).max(255),
        requirements: z.array(z.string()).max(20),
        kbItemIds: z.array(z.string().cuid()).max(10).default([]),
        instructions: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.proposalId, orgId: ctx.internalOrgId },
        select: { id: true, title: true },
      });

      if (!proposal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found.",
        });
      }

      // Load KB items and brand voice in parallel
      const [kbItems, brandVoice] = await Promise.all([
        input.kbItemIds.length > 0
          ? ctx.db.knowledgeBaseItem.findMany({
              where: {
                id: { in: input.kbItemIds },
                orgId: ctx.internalOrgId,
                isActive: true,
              },
              select: { id: true, title: true, content: true, type: true },
            })
          : Promise.resolve([]),
        ctx.db.brandVoice.findUnique({
          where: { orgId: ctx.internalOrgId },
          select: { tone: true, style: true, terminology: true },
        }),
      ]);

      const kbContext =
        kbItems.length > 0
          ? kbItems
              .map(
                (item) =>
                  `[${item.id}] ${item.type}: ${item.title}\n${item.content}`,
              )
              .join("\n\n---\n\n")
          : "No knowledge base context provided.";

      const brandVoiceText = brandVoice
        ? `Tone: ${brandVoice.tone}\nStyle: ${JSON.stringify(brandVoice.style)}\nPreferred terminology: ${JSON.stringify(brandVoice.terminology)}`
        : "Professional, clear, and concise. First-person plural (we/our).";

      const requirementsText = input.requirements
        .map((r, i) => `${i + 1}. ${r}`)
        .join("\n");

      const prompt = loadPrompt("section-generator");
      const userMessage = renderPrompt(prompt.userTemplate, {
        proposal_title: proposal.title,
        section_title: input.sectionTitle,
        requirements: requirementsText,
        brand_voice: brandVoiceText,
        kb_context: kbContext,
        instructions: input.instructions ?? "None.",
      });

      const { data } = await executeWithFallback(
        {
          promptId: "section-generator",
          promptVersion: prompt.metadata.version,
          systemMessage: prompt.systemMessage,
          userMessage,
          maxTokens: prompt.metadata.max_tokens,
          temperature: prompt.metadata.temperature,
        },
        SectionGeneratorOutputSchema,
        kbContext,
      );

      return {
        content: data.content,
        confidenceScore: data.confidence_score,
        citedKbItemIds: data.citations.map((c) => c.kb_item_id),
        reviewNotes: data.review_notes,
        requirementsAddressed: data.requirements_addressed,
        proposalId: input.proposalId,
      };
    }),

  /**
   * Analyze brand voice from uploaded proposal examples.
   * SEC-003: orgId is derived from ctx.internalOrgId — never from client input.
   */
  analyzeBrandVoice: orgProtectedProcedure
    .input(
      z.object({
        sampleTexts: z.array(z.string().min(100)).min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await analyzeBrandVoiceService({
        orgId: ctx.internalOrgId,
        sampleTexts: input.sampleTexts,
      });

      return {
        brandVoiceId: result.brandVoiceId,
        tone: result.output.tone,
        orgId: ctx.internalOrgId,
      };
    }),

  /**
   * Fetch the current brand voice profile for the authenticated organisation.
   * SEC-003: orgId is derived from ctx.internalOrgId — never from client input.
   */
  getBrandVoice: orgProtectedProcedure.query(async ({ ctx }) => {
    return ctx.db.brandVoice.findUnique({
      where: { orgId: ctx.internalOrgId },
    });
  }),

  /**
   * Verify that all extracted requirements are addressed in the proposal.
   * SEC-003: orgId is derived from ctx.internalOrgId — never from client input.
   */
  checkCompliance: orgProtectedProcedure
    .input(
      z.object({
        proposalId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.proposal.findFirst({
        where: { id: input.proposalId, orgId: ctx.internalOrgId },
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
