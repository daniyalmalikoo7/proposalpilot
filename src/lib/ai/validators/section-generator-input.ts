// Zod schema for section-generator prompt input.
// Must stay in sync with docs/prompts/section-generator.v1.md

import { z } from "zod";

export const SectionGeneratorInputSchema = z.object({
  proposalTitle: z.string().min(1).max(255),
  sectionTitle: z.string().min(1).max(255),
  /** Flat list of requirement text strings */
  requirements: z.array(z.string().min(1)).min(1).max(20),
  brandVoice: z.string().max(2000).default("Professional, clear, and concise."),
  /** Formatted knowledge base context block */
  kbContext: z
    .string()
    .max(50_000)
    .default("No knowledge base context available."),
  instructions: z.string().max(2000).default(""),
});

export type SectionGeneratorInput = z.infer<typeof SectionGeneratorInputSchema>;
