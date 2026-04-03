"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/atoms/progress";
import { Button } from "@/components/atoms/button";
import type { Proposal, ProposalStatus } from "@/lib/types/proposal";
import { PROPOSAL_STATUS_LABELS } from "@/lib/types/proposal";

const STATUS_STYLES: Readonly<Record<ProposalStatus, string>> = {
  DRAFT: "bg-pp-background-elevated text-pp-foreground-muted",
  IN_PROGRESS: "bg-blue-950 text-blue-400", // no pp-* blue token
  REVIEW: "bg-purple-950 text-purple-400", // no pp-* purple token
  SUBMITTED: "bg-pp-warning-bg text-pp-warning-text",
  WON: "bg-pp-success-bg text-pp-success-text",
  LOST: "bg-pp-danger-bg text-pp-danger-text",
  ARCHIVED: "bg-pp-background-elevated text-pp-foreground-dim",
};

function formatDeadline(date: Date | null): string {
  if (!date) return "—";
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return `${diff}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ProposalCardProps {
  readonly proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const router = useRouter();
  const isOverdue =
    proposal.deadline !== null && proposal.deadline < new Date();

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 border-b border-pp-border px-4 py-3 transition-colors last:border-0 hover:bg-pp-background-elevated"
      onClick={() => router.push(`/proposals/${proposal.id}`)}
    >
      {/* Title + client */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{proposal.title}</p>
        {proposal.clientName && (
          <p className="truncate text-xs text-pp-foreground-muted">
            {proposal.clientName}
          </p>
        )}
      </div>

      {/* Status badge */}
      <div className="w-24 shrink-0">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            STATUS_STYLES[proposal.status],
          )}
        >
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </span>
      </div>

      {/* Deadline */}
      <div
        className={cn(
          "flex w-20 shrink-0 items-center gap-1 text-xs",
          isOverdue
            ? "text-pp-danger-text"
            : "text-pp-foreground-muted",
        )}
      >
        <Calendar className="h-3 w-3 shrink-0" />
        {formatDeadline(proposal.deadline)}
      </div>

      {/* Completion */}
      <div className="w-28 shrink-0">
        <div className="flex items-center gap-2">
          <Progress value={proposal.completionPct} className="flex-1" />
          <span className="w-8 shrink-0 text-right font-mono text-xs text-pp-foreground-muted">
            {proposal.completionPct}%
          </span>
        </div>
      </div>

      {/* Last edited */}
      <div className="w-10 shrink-0 text-right font-mono text-xs text-pp-foreground-muted">
        {formatRelativeTime(proposal.updatedAt)}
      </div>

      {/* Actions — stopPropagation so the row click doesn't fire */}
      <div className="relative z-10 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
