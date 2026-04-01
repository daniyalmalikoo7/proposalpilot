"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/atoms/progress";
import { Button } from "@/components/atoms/button";
import type { Proposal, ProposalStatus } from "@/lib/types/proposal";
import { PROPOSAL_STATUS_LABELS } from "@/lib/types/proposal";

const STATUS_STYLES: Readonly<Record<ProposalStatus, string>> = {
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  IN_PROGRESS: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  REVIEW:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  SUBMITTED: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  WON: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  LOST: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  ARCHIVED: "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600",
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
      className="group flex cursor-pointer items-center gap-4 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-accent/40"
      onClick={() => router.push(`/proposals/${proposal.id}`)}
    >
      {/* Title + client */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{proposal.title}</p>
        {proposal.clientName && (
          <p className="truncate text-xs text-muted-foreground">
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
            ? "text-red-500 dark:text-red-400"
            : "text-muted-foreground",
        )}
      >
        <Calendar className="h-3 w-3 shrink-0" />
        {formatDeadline(proposal.deadline)}
      </div>

      {/* Completion */}
      <div className="w-28 shrink-0">
        <div className="flex items-center gap-2">
          <Progress value={proposal.completionPct} className="flex-1" />
          <span className="w-8 shrink-0 text-right font-mono text-xs text-muted-foreground">
            {proposal.completionPct}%
          </span>
        </div>
      </div>

      {/* Last edited */}
      <div className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
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
