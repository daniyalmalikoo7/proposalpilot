"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Eye, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { trpc } from "@/lib/trpc/client";
import type { KBItem, KBItemType } from "@/lib/types/proposal";
import { KB_TYPE_LABELS } from "@/lib/types/proposal";

const TYPE_STYLES: Readonly<Record<KBItemType, string>> = {
  CASE_STUDY: "bg-warning-bg text-warning-foreground",
  PAST_PROPOSAL: "bg-info-bg text-info-foreground",
  METHODOLOGY: "bg-accent-muted text-[hsl(var(--accent))]",
  TEAM_BIO: "bg-success-bg text-success-foreground",
  CAPABILITY: "bg-[hsl(214_100%_95%)] text-[hsl(221_83%_45%)]",
  OTHER: "bg-background-subtle text-foreground-muted",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

interface KBItemCardProps {
  readonly item: KBItem;
  readonly onDelete?: (id: string) => void;
}

export function KBItemCard({ item, onDelete }: KBItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: detail } = trpc.kb.get.useQuery({ id: item.id }, { enabled: expanded });

  const handleDeleteConfirm = () => {
    onDelete?.(item.id);
    setConfirmDelete(false);
  };

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-border bg-background-elevated p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Type badge + menu row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background-subtle">
          <FileText className="h-4 w-4 text-foreground-muted" />
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

      {/* Title — click to expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1 rounded"
      >
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
          {item.title}
        </p>
      </button>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-muted">
          {formatFileSize(item.fileSize)} ·{" "}
          {item.uploadedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>

        {/* Radix DropdownMenu — replaces custom div dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`Open menu for ${item.title}`}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={cn(
                "z-50 min-w-[130px] rounded-lg border border-border bg-background-elevated py-1 shadow-md",
                "data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out",
              )}
              align="end"
              sideOffset={4}
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-foreground outline-none hover:bg-background-subtle focus:bg-background-subtle"
                onSelect={() => setExpanded(true)}
              >
                <Eye className="h-3.5 w-3.5" />
                View details
              </DropdownMenu.Item>
              {onDelete && (
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-danger outline-none hover:bg-danger-bg focus:bg-danger-bg"
                  onSelect={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Expanded details panel */}
      {expanded && (
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-muted">Uploaded</span>
            <span>
              {item.uploadedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-muted">File size</span>
            <span>{formatFileSize(item.fileSize)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-foreground-muted">Preview</span>
            {detail ? (
              <p className="text-xs text-foreground leading-relaxed line-clamp-6">
                {detail.content.slice(0, 500)}
                {detail.content.length > 500 ? "…" : ""}
              </p>
            ) : (
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            )}
          </div>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-7 w-full border-danger/30 text-xs text-danger hover:bg-danger-bg hover:text-danger-foreground"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete document
            </Button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-foreground-muted hover:text-foreground underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background-elevated/95 p-4 backdrop-blur-sm">
          <p className="text-center text-sm font-medium">
            Delete this document?
          </p>
          <p className="text-center text-xs text-foreground-muted">
            This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
