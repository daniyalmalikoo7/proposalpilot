"use client";

import { useState } from "react";
import { FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import type { KBItem, KBItemType } from "@/lib/types/proposal";
import { KB_TYPE_LABELS } from "@/lib/types/proposal";

const TYPE_STYLES: Readonly<Record<KBItemType, string>> = {
  CASE_STUDY:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  PAST_PROPOSAL: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  METHODOLOGY:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  TEAM_BIO:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  CAPABILITY: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  OTHER: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

interface KBItemCardProps {
  readonly item: KBItem;
  readonly onDelete?: () => void;
}

export function KBItemCard({ item, onDelete }: KBItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setExpanded((v) => !v);
      }}
      className={cn(
        "group relative flex cursor-pointer select-none flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm",
        expanded && "ring-1 ring-primary/20",
      )}
    >
      {/* Type badge + icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            TYPE_STYLES[item.type],
          )}
        >
          {KB_TYPE_LABELS[item.type]}
        </span>
      </div>

      {/* Title */}
      <p
        className={cn(
          "text-sm font-medium leading-snug",
          !expanded && "line-clamp-2 min-h-[2.5rem]",
        )}
      >
        {item.title}
      </p>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-2 border-t border-border pt-2">
          {item.chunkCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              {item.chunkCount} chunk{item.chunkCount !== 1 ? "s" : ""} indexed
            </p>
          )}
          {item.contentPreview && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {item.contentPreview}
              {item.contentPreview.length >= 200 ? "…" : ""}
            </p>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      )}

      {/* Footer: meta + "..." menu placeholder (wired in fix 6) */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatFileSize(item.fileSize)} ·{" "}
          {item.uploadedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
