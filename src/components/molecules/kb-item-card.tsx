"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, FileText, MoreHorizontal, Trash2 } from "lucide-react";
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
  readonly onDelete?: (id: string) => void;
}

export function KBItemCard({ item, onDelete }: KBItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleDeleteConfirm = () => {
    onDelete?.(item.id);
    setConfirmDelete(false);
  };

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      {/* Type badge + icon row */}
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

      {/* Title — click to expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-left"
      >
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
          {item.title}
        </p>
      </button>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatFileSize(item.fileSize)} ·{" "}
          {item.uploadedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>

        {/* "..." menu */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[130px] rounded-md border border-border bg-popover py-1 shadow-md">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                onClick={() => {
                  setExpanded(true);
                  setMenuOpen(false);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                View details
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5"
                  onClick={() => {
                    setConfirmDelete(true);
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded details panel */}
      {expanded && (
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Uploaded</span>
            <span>
              {item.uploadedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">File size</span>
            <span>{formatFileSize(item.fileSize)}</span>
          </div>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-7 w-full border-destructive/30 text-xs text-destructive hover:bg-destructive/5"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete document
            </Button>
          )}
        </div>
      )}

      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-card/95 p-4 backdrop-blur-sm">
          <p className="text-center text-sm font-medium">
            Delete this document?
          </p>
          <p className="text-center text-xs text-muted-foreground">
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
