"use client";

import { useState } from "react";
import { Plus, TrendingUp, Clock, Target, Layers } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ProposalCard } from "@/components/molecules/proposal-card";
import type { Proposal, ProposalStatus } from "@/lib/types/proposal";
import { cn } from "@/lib/utils";

const NOW = Date.now();
const DAY = 86_400_000;

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "1",
    title: "Digital Transformation Initiative",
    clientName: "Apex Financial Services",
    status: "IN_PROGRESS",
    deadline: new Date(NOW + 3 * DAY),
    completionPct: 68,
    updatedAt: new Date(NOW - 3_600_000),
    createdAt: new Date(NOW - 7 * DAY),
  },
  {
    id: "2",
    title: "Cloud Migration Strategy",
    clientName: "NovaTech Corp",
    status: "REVIEW",
    deadline: new Date(NOW + 8 * DAY),
    completionPct: 91,
    updatedAt: new Date(NOW - 7_200_000),
    createdAt: new Date(NOW - 14 * DAY),
  },
  {
    id: "3",
    title: "Cybersecurity Assessment & Roadmap",
    clientName: "Meridian Health",
    status: "DRAFT",
    deadline: new Date(NOW + 21 * DAY),
    completionPct: 22,
    updatedAt: new Date(NOW - DAY),
    createdAt: new Date(NOW - 2 * DAY),
  },
  {
    id: "4",
    title: "Data Analytics Platform",
    clientName: "Global Logistics Ltd",
    status: "SUBMITTED",
    deadline: new Date(NOW - 2 * DAY),
    completionPct: 100,
    updatedAt: new Date(NOW - 3 * DAY),
    createdAt: new Date(NOW - 18 * DAY),
  },
  {
    id: "5",
    title: "ERP Modernisation Project",
    clientName: "Harbor Manufacturing",
    status: "WON",
    deadline: null,
    completionPct: 100,
    updatedAt: new Date(NOW - 5 * DAY),
    createdAt: new Date(NOW - 30 * DAY),
  },
  {
    id: "6",
    title: "Customer Portal Redesign",
    clientName: "Pacific Retail Group",
    status: "LOST",
    deadline: null,
    completionPct: 100,
    updatedAt: new Date(NOW - 10 * DAY),
    createdAt: new Date(NOW - 45 * DAY),
  },
  {
    id: "7",
    title: "AI Automation Strategy",
    clientName: "Venture Capital Firm",
    status: "DRAFT",
    deadline: new Date(NOW + 14 * DAY),
    completionPct: 5,
    updatedAt: new Date(NOW - 1_800_000),
    createdAt: new Date(NOW - DAY),
  },
];

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

const STATS = [
  { label: "Active", value: "4", icon: Layers, sub: "+2 this week" },
  { label: "Win Rate", value: "50%", icon: TrendingUp, sub: "+5% vs last mo." },
  {
    label: "Avg. Completion",
    value: "69%",
    icon: Target,
    sub: "across active",
  },
  {
    label: "Avg. Turnaround",
    value: "6.2d",
    icon: Clock,
    sub: "to submission",
  },
] as const;

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<ProposalStatus | "ALL">(
    "ALL",
  );
  const [cursor, setCursor] = useState(0);

  const filtered =
    activeFilter === "ALL"
      ? MOCK_PROPOSALS
      : MOCK_PROPOSALS.filter((p) => p.status === activeFilter);

  const page = filtered.slice(cursor, cursor + PAGE_SIZE);
  const hasNext = cursor + PAGE_SIZE < filtered.length;
  const hasPrev = cursor > 0;

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
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map((s) => {
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
                ? MOCK_PROPOSALS.length
                : MOCK_PROPOSALS.filter((p) => p.status === tab.value).length;
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

        {/* Rows */}
        {page.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No proposals in this category.
          </p>
        ) : (
          page.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        )}

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
