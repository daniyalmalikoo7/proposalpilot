"use client";

// RequirementsSidebar — left panel of the proposal editor.
// Displays extracted requirements grouped by section with priority badges.

import { FileSearch } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import { cn } from "@/lib/utils";

export interface Requirement {
  id: string;
  section: string;
  requirement: string;
  priority: "high" | "medium" | "low";
  addressed: boolean;
}

interface RequirementsSidebarProps {
  readonly requirements: Requirement[];
  readonly selectedRequirementIds: ReadonlySet<string>;
  readonly onToggleRequirement: (id: string) => void;
  readonly isLoading?: boolean;
}

const PRIORITY_VARIANTS: Record<
  Requirement["priority"],
  "default" | "secondary" | "outline"
> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function RequirementsSidebar({
  requirements,
  selectedRequirementIds,
  onToggleRequirement,
  isLoading = false,
}: RequirementsSidebarProps) {
  // Group by section
  const grouped = requirements.reduce<Record<string, Requirement[]>>(
    (acc, req) => {
      const section = req.section || "General";
      if (!acc[section]) acc[section] = [];
      acc[section].push(req);
      return acc;
    },
    {},
  );

  if (isLoading) {
    return (
      <aside className="flex h-full w-72 flex-shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Requirements
          </h2>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5 rounded-md border border-border p-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (requirements.length === 0) {
    return (
      <aside className="flex h-full w-72 flex-shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Requirements
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FileSearch className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-[13px] text-muted-foreground">
            Upload an RFP to extract requirements automatically.
          </p>
        </div>
      </aside>
    );
  }

  const addressedCount = requirements.filter((r) => r.addressed).length;

  return (
    <aside className="flex h-full w-72 flex-shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Requirements</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {addressedCount} / {requirements.length} addressed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(grouped).map(([section, reqs]) => (
          <div key={section}>
            <div className="sticky top-0 z-10 bg-muted/60 px-4 py-2 backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section}
              </p>
            </div>
            <ul className="space-y-1 p-2">
              {reqs.map((req) => {
                const isSelected = selectedRequirementIds.has(req.id);
                return (
                  <li key={req.id}>
                    <button
                      type="button"
                      onClick={() => onToggleRequirement(req.id)}
                      className={cn(
                        "w-full rounded-md border px-3 py-1.5 text-left text-[13px] leading-snug transition-colors",
                        isSelected
                          ? "border-primary/40 bg-primary/5 text-foreground"
                          : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                        req.addressed && "opacity-60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-3 flex-1">
                          {req.requirement}
                        </span>
                        <Badge
                          variant={PRIORITY_VARIANTS[req.priority]}
                          className="shrink-0 capitalize text-[11px]"
                        >
                          {req.priority}
                        </Badge>
                      </div>
                      {req.addressed && (
                        <span className="mt-1 block text-[10px] text-green-600 dark:text-green-400">
                          ✓ addressed
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
