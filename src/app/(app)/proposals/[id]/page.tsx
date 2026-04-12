"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, Check, Download, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/atoms/skeleton";
import { Button } from "@/components/atoms/button";
import { RequirementsSidebar } from "@/components/organisms/requirements-sidebar";
import { KBSearchPanel } from "@/components/organisms/kb-search-panel";
import { EditorCenterPanel } from "./_components/editor-center-panel";
import { useProposalEditor } from "./_components/use-proposal-editor";

export default function ProposalEditorPage() {
  const { id: proposalId } = useParams<{ id: string }>();
  const [showKbPanel, setShowKbPanel] = useState(true);

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
      <div className="flex h-screen flex-col overflow-hidden" aria-busy="true" aria-label="Loading proposal">
        {/* Top bar skeleton */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background-elevated px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-px" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-14" />
          </div>
        </div>
        {/* 3-panel body skeleton */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: requirements sidebar */}
          <div className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-background-subtle">
            <div className="border-b border-border px-4 py-3">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5 rounded-md border border-border p-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
          {/* Center: editor */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-background-elevated/50 px-4 py-2">
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="space-y-4 overflow-y-auto p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
          {/* Right: KB panel */}
          <div className="flex h-full w-64 shrink-0 flex-col border-l border-border bg-background-subtle">
            <div className="border-b border-border px-4 py-3">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="p-3">
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
            <div className="space-y-2 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>
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
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background-elevated px-6">
        {/* Breadcrumb + title */}
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/proposals"
            className="shrink-0 text-xs text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            ← Proposals
          </Link>
          <span className="text-foreground-dim">/</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {proposal.title}
            </p>
            {proposal.clientName && (
              <p className="truncate text-xs text-foreground-muted">
                {proposal.clientName}
              </p>
            )}
          </div>
        </div>

        {/* Save indicator + export buttons */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Animated save state — fades between states */}
          <AnimatePresence mode="wait">
            {saveState === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-foreground-muted"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </motion.span>
            )}
            {saveState === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-success-foreground"
              >
                <Check className="h-3 w-3" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          {/* KB panel toggle — shows selected count when items are active */}
          <Button
            size="sm"
            variant={showKbPanel ? "secondary" : "ghost"}
            onClick={() => setShowKbPanel((v) => !v)}
            className="h-8 gap-1.5 text-xs"
            aria-label={
              showKbPanel
                ? "Hide knowledge base panel"
                : "Show knowledge base panel"
            }
          >
            <BookOpen className="h-3.5 w-3.5" />
            {selectedKbIds.size > 0
              ? `${selectedKbIds.size} KB selected`
              : "KB"}
          </Button>
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

        {/* Right: Knowledge base search (collapsible via top-bar toggle) */}
        {showKbPanel && (
          <KBSearchPanel
            selectedKbItemIds={selectedKbIds}
            onToggleKbItem={handleToggleKbItem}
            onSearch={handleKbSearch}
          />
        )}
      </div>
    </div>
  );
}
