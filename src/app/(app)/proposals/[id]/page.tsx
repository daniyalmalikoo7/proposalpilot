"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { RequirementsSidebar } from "@/components/organisms/requirements-sidebar";
import { KBSearchPanel } from "@/components/organisms/kb-search-panel";
import { EditorCenterPanel } from "./_components/editor-center-panel";
import { useProposalEditor } from "./_components/use-proposal-editor";

export default function ProposalEditorPage() {
  const { id: proposalId } = useParams<{ id: string }>();

  const {
    proposalQuery,
    proposal,
    sections,
    requirements,
    hasRequirements,
    hasSections,
    hasAnyContent,
    isExtracting,
    extractionPhase,
    extractionError,
    isExporting,
    pendingGenQueue,
    activePendingGenId,
    saveState,
    selectedReqIds,
    selectedKbIds,
    generateContext,
    isCreatingSections,
    setSelectedReqIds,
    setExtractionError,
    handleContentChange,
    handleGenerateComplete,
    handleToggleRequirement,
    handleToggleKbItem,
    handleKbSearch,
    handleRFPUpload,
    handleSkipRFP,
    handleGenerateAll,
    handleExport,
  } = useProposalEditor(proposalId);

  // ── Loading / error ───────────────────────────────────────────────────────────
  if (proposalQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (proposalQuery.error || !proposal) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-destructive">
          {proposalQuery.error?.message ?? "Proposal not found."}
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Top bar ────────────────────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        {/* Breadcrumb + title */}
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/dashboard"
            className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {proposal.title}
            </p>
            {proposal.clientName && (
              <p className="truncate text-xs text-muted-foreground">
                {proposal.clientName}
              </p>
            )}
          </div>
        </div>

        {/* Save indicator + export buttons */}
        <div className="flex shrink-0 items-center gap-3">
          {saveState === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </span>
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleExport("docx")}
            disabled={isExporting || !hasAnyContent}
            className="h-8 gap-1.5 text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            DOCX
          </Button>
          <Button
            size="sm"
            onClick={() => void handleExport("pdf")}
            disabled={isExporting || !hasAnyContent}
            className="h-8 gap-1.5 text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* ── 3-panel body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Requirements sidebar */}
        <RequirementsSidebar
          requirements={requirements}
          selectedRequirementIds={selectedReqIds}
          onToggleRequirement={handleToggleRequirement}
          isLoading={isExtracting}
        />

        {/* Center: context-sensitive content */}
        <EditorCenterPanel
          hasRequirements={hasRequirements}
          hasSections={hasSections}
          isExtracting={isExtracting}
          extractionPhase={extractionPhase}
          extractionError={extractionError}
          requirements={requirements}
          sections={sections}
          pendingGenQueue={pendingGenQueue}
          activePendingGenId={activePendingGenId}
          isCreatingSections={isCreatingSections}
          generateContext={generateContext}
          selectedReqIds={selectedReqIds}
          onRFPUpload={handleRFPUpload}
          onSkipRFP={() => void handleSkipRFP()}
          onClearError={() => setExtractionError(null)}
          onGenerateAll={() => void handleGenerateAll()}
          onContentChange={handleContentChange}
          onGenerateComplete={handleGenerateComplete}
          onSelectAllRequirements={() =>
            setSelectedReqIds(new Set(requirements.map((r) => r.id)))
          }
        />

        {/* Right: Knowledge base search */}
        <KBSearchPanel
          selectedKbItemIds={selectedKbIds}
          onToggleKbItem={handleToggleKbItem}
          onSearch={handleKbSearch}
        />
      </div>
    </div>
  );
}
