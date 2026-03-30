// Zod output schema for the section-generator prompt.
// Must match the JSON schema declared in docs/prompts/section-generator.v1.md.

import { z } from "zod";

export const RequirementAddressedSchema = z.object({
  requirement_index: z.number().int().nonnegative(),
  addressed: z.boolean(),
  how_addressed: z.string().max(100),
});

export const CitationSchema = z.object({
  kb_item_id: z.string(),
  relevance: z.string().max(100),
});

export const SectionGeneratorOutputSchema = z.object({
  title: z.string(),
  content: z.string(),
  confidence_score: z.number().min(0).max(1),
  requirements_addressed: z.array(RequirementAddressedSchema),
  citations: z.array(CitationSchema),
  review_notes: z.string().nullable(),
});

export type SectionGeneratorOutput = z.infer<
  typeof SectionGeneratorOutputSchema
>;
