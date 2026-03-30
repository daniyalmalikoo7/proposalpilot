import type { Metadata } from "next";
import { Button } from "@/components/atoms/button";

export const metadata: Metadata = {
  title: "Knowledge Base — ProposalPilot",
};

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">
            Case studies, past proposals, and capabilities that power your AI
            responses.
          </p>
        </div>
        <Button>Upload Document</Button>
      </div>

      {/* Type filter tabs placeholder */}
      <div className="flex gap-2">
        {["All", "Case Studies", "Past Proposals", "Methodology", "Team"].map(
          (tab) => (
            <button
              key={tab}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground first:bg-primary first:text-primary-foreground"
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* Items grid placeholder */}
      <div className="rounded-lg border border-border bg-card px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Your knowledge base is empty. Upload case studies and past proposals
          to improve AI generation quality.
        </p>
      </div>
    </div>
  );
}
