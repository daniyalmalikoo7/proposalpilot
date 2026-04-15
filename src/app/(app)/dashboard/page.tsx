"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingUp, Clock, Target, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { ProposalCard } from "@/components/molecules/proposal-card";
import { FilterTabBar } from "@/components/molecules/filter-tab-bar";
import { ProposalTableSkeleton } from "@/components/molecules/proposal-table-skeleton";
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

type DbProposal = {
  id: string;
  title: string;
  clientName: string | null;
  status: string;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sections: ReadonlyArray<{ content: string | null }> | null | undefined;
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function mapProposal(p: DbProposal): Proposal {
  const sections = p.sections ?? [];
  const total = sections.length;
  const filled = sections.filter((s) => (s.content ?? "").trim().length > 0).length;
  const completionPct = total > 0 ? Math.round((filled / total) * 100) : 0;
  return {
    id: p.id,
    title: p.title,
    clientName: p.clientName,
    status: p.status as ProposalStatus,
    deadline: p.deadline,
    completionPct,
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

  const filterTabsWithCounts = FILTER_TABS.map((tab) => ({
    ...tab,
    count:
      tab.value === "ALL"
        ? proposals.length
        : proposals.filter((p) => p.status === tab.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-foreground-muted">
            Your proposal pipeline.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      <NewProposalDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Stats — hidden when no proposals to avoid "No data yet" noise */}
      <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-4", !isLoading && proposals.length === 0 && "hidden")}>
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
              isLoading || stats.winRate === null
                ? "No data yet"
                : `${stats.winRate}%`,
            icon: TrendingUp,
            sub: "won vs decided",
          },
          {
            label: "Avg. Completion",
            value:
              isLoading || stats.avgCompletion === null
                ? "No data yet"
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
              className="rounded-lg border border-border bg-background-elevated px-4 py-4 shadow-sm"
            >
              <div className="flex items-center gap-1.5 text-foreground-muted">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p
                className={cn(
                  "mt-1.5 tracking-tight",
                  s.value === "No data yet"
                    ? "text-sm text-foreground-muted"
                    : "font-mono text-2xl font-semibold",
                )}
              >
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Proposal table */}
      <div className="rounded-lg border border-border bg-background-elevated shadow-sm">
        {/* Filter tabs */}
        <div className="border-b border-border px-3 py-2">
          <FilterTabBar
            tabs={filterTabsWithCounts}
            activeTab={activeFilter}
            onTabChange={handleFilterChange}
          />
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-xs font-medium text-foreground-muted">
          <div className="flex-1">Title</div>
          <div className="w-24 shrink-0">Status</div>
          <div className="hidden w-20 shrink-0 md:block">Deadline</div>
          <div className="hidden w-28 shrink-0 md:block">Progress</div>
          <div className="w-10 shrink-0 text-right">Edited</div>
          <div className="w-7 shrink-0" />
        </div>

        {/* Loading — shape-matched skeleton */}
        {isLoading && <ProposalTableSkeleton rows={5} />}

        {/* Error */}
        {error && !isLoading && (
          <p className="px-4 py-8 text-center text-sm text-danger">
            {error.message}
          </p>
        )}

        {/* Empty state */}
        {!isLoading && !error && proposals.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm font-medium">No proposals yet</p>
            <p className="text-sm text-foreground-muted">
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
          <p className="px-4 py-8 text-center text-sm text-foreground-muted">
            No proposals in this category.
          </p>
        )}

        {/* Rows — staggered reveal */}
        {!isLoading && !error && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {page.map((proposal) => (
              <motion.div
                key={proposal.id}
                variants={rowVariants}
              >
                <ProposalCard proposal={proposal} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="font-mono text-xs text-foreground-muted">
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
