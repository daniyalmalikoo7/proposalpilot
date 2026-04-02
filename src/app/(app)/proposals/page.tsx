"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
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
          <div className="flex items-center justify-center px-6 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.items.length ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No proposals found. Upload an RFP to create your first proposal.
            </p>
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
