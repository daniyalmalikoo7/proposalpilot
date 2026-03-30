// Zod output schema for the brand-voice-analyzer prompt.
// Must match the JSON schema declared in docs/prompts/brand-voice-analyzer.v1.md.

import { z } from "zod";

export const BrandVoiceOutputSchema = z.object({
  tone: z.string().min(1).max(500),
  style: z.object({
    formality: z.enum(["formal", "semi-formal", "conversational"]),
    sentence_length: z.enum(["short", "medium", "long", "varied"]),
    active_voice_preference: z.boolean(),
    use_of_first_person_plural: z.boolean(),
    use_of_bullet_points: z.boolean(),
  }),
  terminology: z.object({
    preferred_terms: z.array(z.string()).max(20),
    avoided_terms: z.array(z.string()).max(20),
    industry_jargon_level: z.enum(["low", "medium", "high"]),
  }),
  writing_patterns: z.array(z.string().max(200)).max(5),
  sample_phrases: z.array(z.string().max(200)).max(5),
});

export type BrandVoiceOutput = z.infer<typeof BrandVoiceOutputSchema>;
