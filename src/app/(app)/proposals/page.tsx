import type { Metadata } from "next";
import { Button } from "@/components/atoms/button";

export const metadata: Metadata = {
  title: "Proposals — ProposalPilot",
};

export default function ProposalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-sm text-muted-foreground">
            Manage your proposal pipeline.
          </p>
        </div>
        <Button>New Proposal</Button>
      </div>

      {/* Pipeline table placeholder */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <p className="text-sm font-medium text-muted-foreground">
            All Proposals
          </p>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No proposals found. Upload an RFP to create your first proposal.
          </p>
        </div>
      </div>
    </div>
  );
}
