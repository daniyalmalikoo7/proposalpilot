// Shared types for the ProposalEditor module.

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  order: number;
  confidenceScore?: number | null;
}

export interface GenerateContext {
  proposalId: string;
  /** All selected requirement texts — used for the Generate button disabled check. */
  requirements: string[];
  /**
   * Requirements pre-grouped by section name.
   * useSectionGeneration uses this to send only the relevant subset to the
   * stream-section endpoint, avoiding the max(20) cap on large RFPs.
   */
  requirementsBySection: Record<string, string[]>;
  kbItemIds: string[];
  instructions?: string;
}
