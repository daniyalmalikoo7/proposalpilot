"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FilePlus2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { NewProposalDialog } from "@/components/organisms/new-proposal-dialog";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  SUBMITTED: "Submitted",
  WON: "Won",
  LOST: "Lost",
  ARCHIVED: "Archived",
};

export default function ProposalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading } = trpc.proposal.list.useQuery({});
  const utils = trpc.useUtils();
  const deleteMutation = trpc.proposal.delete.useMutation({
    onMutate: ({ id }) => setDeletingId(id),
    onSuccess: async () => {
      setDeletingId(null);
      setConfirmDeleteId(null);
      await utils.proposal.list.invalidate();
    },
    onError: () => setDeletingId(null),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-sm text-foreground-muted">
            Manage your proposal pipeline.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-background-elevated shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <p className="text-sm font-medium text-foreground-muted">
            All Proposals
          </p>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background-subtle">
              <FilePlus2 className="h-7 w-7 text-foreground-muted" />
            </div>
            <div>
              <p className="text-base font-semibold">No proposals yet</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Upload an RFP and let AI draft your first proposal in minutes.
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              Create your first proposal
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((proposal) => (
              <li key={proposal.id} className="group relative flex items-center">
                <Link
                  href={`/proposals/${proposal.id}`}
                  className={cn(
                    "flex flex-1 items-center gap-4 px-6 py-4 text-left transition-colors",
                    "hover:bg-background-subtle",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent))]",
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0 text-foreground-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {proposal.title}
                    </p>
                    {proposal.clientName && (
                      <p className="truncate text-xs text-foreground-muted">
                        {proposal.clientName}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-background-subtle px-2 py-0.5 text-xs text-foreground-muted">
                    {STATUS_LABEL[proposal.status] ?? proposal.status}
                  </span>
                  <span className="shrink-0 text-xs text-foreground-muted">
                    {new Date(proposal.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
                <div className="shrink-0 pr-4">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(proposal.id); }}
                    className="rounded p-1 text-foreground-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    aria-label={`Delete ${proposal.title}`}
                    disabled={deletingId === proposal.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewProposalDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-background-elevated p-6 shadow-xl">
            <h3 className="text-base font-semibold">Delete proposal?</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              All sections and requirements will be permanently deleted. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate({ id: confirmDeleteId })}
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
