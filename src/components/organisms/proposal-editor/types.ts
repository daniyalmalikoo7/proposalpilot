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
  orgId: string;
  requirements: string[];
  kbItemIds: string[];
  instructions?: string;
}
