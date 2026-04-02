"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FilePlus2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { NewProposalDialog } from "@/components/organisms/new-proposal-dialog";
import { trpc } from "@/lib/trpc/client";

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
  const router = useRouter();

  const { data, isLoading } = trpc.proposal.list.useQuery({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-sm text-muted-foreground">
            Manage your proposal pipeline.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>New Proposal</Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <p className="text-sm font-medium text-muted-foreground">
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FilePlus2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                No proposals yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
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
              <li key={proposal.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/40"
                  onClick={() => router.push(`/proposals/${proposal.id}`)}
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {proposal.title}
                    </p>
                    {proposal.clientName && (
                      <p className="truncate text-xs text-muted-foreground">
                        {proposal.clientName}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {STATUS_LABEL[proposal.status] ?? proposal.status}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(proposal.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewProposalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
