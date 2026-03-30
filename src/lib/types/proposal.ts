export const PROPOSAL_STATUSES = [
  "DRAFT",
  "IN_PROGRESS",
  "REVIEW",
  "SUBMITTED",
  "WON",
  "LOST",
  "ARCHIVED",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const KB_ITEM_TYPES = [
  "CASE_STUDY",
  "PAST_PROPOSAL",
  "METHODOLOGY",
  "TEAM_BIO",
  "CAPABILITY",
  "OTHER",
] as const;

export type KBItemType = (typeof KB_ITEM_TYPES)[number];

export interface Proposal {
  readonly id: string;
  readonly title: string;
  readonly clientName: string | null;
  readonly status: ProposalStatus;
  readonly deadline: Date | null;
  readonly completionPct: number;
  readonly updatedAt: Date;
  readonly createdAt: Date;
}

export interface KBItem {
  readonly id: string;
  readonly title: string;
  readonly type: KBItemType;
  readonly fileSize: number;
  readonly uploadedAt: Date;
  readonly isWin: boolean;
}

export const PROPOSAL_STATUS_LABELS: Readonly<Record<ProposalStatus, string>> =
  {
    DRAFT: "Draft",
    IN_PROGRESS: "In Progress",
    REVIEW: "In Review",
    SUBMITTED: "Sent",
    WON: "Won",
    LOST: "Lost",
    ARCHIVED: "Archived",
  };

export const KB_TYPE_LABELS: Readonly<Record<KBItemType, string>> = {
  CASE_STUDY: "Case Study",
  PAST_PROPOSAL: "Past Proposal",
  METHODOLOGY: "Methodology",
  TEAM_BIO: "Team Bio",
  CAPABILITY: "Capability",
  OTHER: "Other",
};
