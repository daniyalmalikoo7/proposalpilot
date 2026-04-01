"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingUp, Clock, Target, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ProposalCard } from "@/components/molecules/proposal-card";
import { NewProposalDialog } from "@/components/organisms/new-proposal-dialog";
import { trpc } from "@/lib/trpc/client";
import type { Proposal, ProposalStatus } from "@/lib/types/proposal";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

const FILTER_TABS: ReadonlyArray<{
  label: string;
  value: ProposalStatus | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "In Review", value: "REVIEW" },
  { label: "Sent", value: "SUBMITTED" },
  { label: "Won", value: "WON" },
  { label: "Lost", value: "LOST" },
];

// Map DB proposal status to a rough completion percentage.
const STATUS_TO_PCT: Readonly<Record<string, number>> = {
  DRAFT: 10,
  IN_PROGRESS: 50,
  REVIEW: 80,
  SUBMITTED: 95,
  WON: 100,
  LOST: 100,
  ARCHIVED: 100,
};

type DbProposal = {
  id: string;
  title: string;
  clientName: string | null;
  status: string;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapProposal(p: DbProposal): Proposal {
  return {
    id: p.id,
    title: p.title,
    clientName: p.clientName,
    status: p.status as ProposalStatus,
    deadline: p.deadline,
    completionPct: STATUS_TO_PCT[p.status] ?? 0,
    updatedAt: p.updatedAt,
    createdAt: p.createdAt,
  };
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<ProposalStatus | "ALL">(
    "ALL",
  );
  const [cursor, setCursor] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = trpc.proposal.list.useQuery(
    { limit: 100 },
    { retry: 1 },
  );

  const proposals = useMemo(() => (data?.items ?? []).map(mapProposal), [data]);

  const filtered = useMemo(
    () =>
      activeFilter === "ALL"
        ? proposals
        : proposals.filter((p) => p.status === activeFilter),
    [proposals, activeFilter],
  );

  const page = filtered.slice(cursor, cursor + PAGE_SIZE);
  const hasNext = cursor + PAGE_SIZE < filtered.length;
  const hasPrev = cursor > 0;

  const stats = useMemo(() => {
    const active = proposals.filter((p) =>
      ["DRAFT", "IN_PROGRESS", "REVIEW"].includes(p.status),
    ).length;
    const decided = proposals.filter((p) => ["WON", "LOST"].includes(p.status));
    const won = proposals.filter((p) => p.status === "WON").length;
    const winRate =
      decided.length > 0 ? Math.round((won / decided.length) * 100) : null;
    const active2 = proposals.filter((p) =>
      ["IN_PROGRESS", "REVIEW"].includes(p.status),
    );
    const avgCompletion =
      active2.length > 0
        ? Math.round(
            active2.reduce((s, p) => s + p.completionPct, 0) / active2.length,
          )
        : null;

    return { active, winRate, avgCompletion };
  }, [proposals]);

  const handleFilterChange = (value: ProposalStatus | "ALL") => {
    setActiveFilter(value);
    setCursor(0);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your proposal pipeline.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      <NewProposalDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Active",
            value: isLoading ? "—" : String(stats.active),
            icon: Layers,
            sub: "draft, in progress or review",
          },
          {
            label: "Win Rate",
            value:
              isLoading || stats.winRate === null ? "—" : `${stats.winRate}%`,
            icon: TrendingUp,
            sub: "won vs decided",
          },
          {
            label: "Avg. Completion",
            value:
              isLoading || stats.avgCompletion === null
                ? "—"
                : `${stats.avgCompletion}%`,
            icon: Target,
            sub: "across active",
          },
          {
            label: "Total",
            value: isLoading ? "—" : String(proposals.length),
            icon: Clock,
            sub: "proposals all time",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-card px-4 py-4"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Proposal table */}
      <div className="rounded-lg border border-border bg-card">
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-3 py-2">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "ALL"
                ? proposals.length
                : proposals.filter((p) => p.status === tab.value).length;
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleFilterChange(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 font-mono text-[10px]",
                    isActive ? "bg-primary-foreground/20" : "bg-muted",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="flex-1">Title</div>
          <div className="w-24 shrink-0">Status</div>
          <div className="w-20 shrink-0">Deadline</div>
          <div className="w-28 shrink-0">Progress</div>
          <div className="w-10 shrink-0 text-right">Edited</div>
          <div className="w-7 shrink-0" />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading proposals…
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <p className="px-4 py-8 text-center text-sm text-destructive">
            {error.message}
          </p>
        )}

        {/* Empty state */}
        {!isLoading && !error && proposals.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm font-medium">No proposals yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first proposal to start winning bids.
            </p>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Proposal
            </Button>
          </div>
        )}

        {/* Filter empty state */}
        {!isLoading && !error && proposals.length > 0 && page.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No proposals in this category.
          </p>
        )}

        {/* Rows */}
        {!isLoading &&
          !error &&
          page.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground">
              {cursor + 1}–{Math.min(cursor + PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev}
                onClick={() => setCursor((c) => Math.max(0, c - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext}
                onClick={() => setCursor((c) => c + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
