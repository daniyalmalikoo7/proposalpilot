// Zod output schema for the requirement-extractor prompt.
// Must match the JSON schema declared in docs/prompts/requirement-extractor.v1.md.

import { z } from "zod";

export const ExtractedRequirementItemSchema = z.object({
  section: z.string(),
  requirement: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  confidence: z.number().min(0).max(1),
  source_excerpt: z.string().max(200),
});

export const RequirementExtractorOutputSchema = z.object({
  requirements: z.array(ExtractedRequirementItemSchema),
  document_summary: z.string(),
  total_requirements: z.number().int().nonnegative(),
  sections_found: z.array(z.string()),
});

export type RequirementExtractorOutput = z.infer<
  typeof RequirementExtractorOutputSchema
>;
