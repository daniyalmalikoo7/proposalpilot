"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BookOpen, Check, ChevronDown, Download, ListChecks, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/atoms/skeleton";
import { Button } from "@/components/atoms/button";
import { RequirementsSidebar } from "@/components/organisms/requirements-sidebar";
import { KBSearchPanel } from "@/components/organisms/kb-search-panel";
import { EditorCenterPanel } from "./_components/editor-center-panel";
import { useProposalEditor } from "./_components/use-proposal-editor";

export default function ProposalEditorPage() {
  const { id: proposalId } = useParams<{ id: string }>();
  // Desktop: KB panel shown inline by default
  const [showKbPanel, setShowKbPanel] = useState(true);
  // Mobile overlays — both closed by default so editor fills the screen
  const [showReqOverlay, setShowReqOverlay] = useState(false);
  const [showKbOverlay, setShowKbOverlay] = useState(false);

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
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background-elevated px-3 md:px-6">
        {/* Breadcrumb + title */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
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
        <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
          {/* Animated save state — fades between states */}
          <AnimatePresence mode="wait">
            {saveState === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="hidden items-center gap-1.5 text-xs text-foreground-muted sm:flex"
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
                className="hidden items-center gap-1.5 text-xs text-success-foreground sm:flex"
              >
                <Check className="h-3 w-3" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>

          {/* Requirements toggle — mobile only */}
          <Button
            size="sm"
            variant={showReqOverlay ? "secondary" : "ghost"}
            onClick={() => setShowReqOverlay((v) => !v)}
            className="h-8 gap-1 text-xs md:hidden"
            aria-label={showReqOverlay ? "Hide requirements" : "Show requirements"}
          >
            <ListChecks className="h-3.5 w-3.5" />
            Req
          </Button>

          {/* KB toggle — mobile only (opens overlay) */}
          <Button
            size="sm"
            variant={showKbOverlay ? "secondary" : "ghost"}
            onClick={() => setShowKbOverlay((v) => !v)}
            className="h-8 gap-1 text-xs md:hidden"
            aria-label={showKbOverlay ? "Hide knowledge base" : "Show knowledge base"}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {selectedKbIds.size > 0 ? `${selectedKbIds.size}` : "KB"}
          </Button>

          {/* KB panel toggle — desktop only (inline panel) */}
          <Button
            size="sm"
            variant={showKbPanel ? "secondary" : "ghost"}
            onClick={() => setShowKbPanel((v) => !v)}
            className="hidden h-8 gap-1.5 text-xs md:flex"
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isExporting || !hasAnyContent}
                className="h-8 gap-1.5 text-xs"
                aria-label="Export proposal"
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[100px] rounded-lg border border-border bg-background-elevated py-1 shadow-md"
                align="end"
                sideOffset={4}
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-foreground outline-none hover:bg-background-subtle focus:bg-background-subtle disabled:pointer-events-none disabled:opacity-50"
                  onSelect={() => void handleExport("docx")}
                  disabled={isExporting || !hasAnyContent}
                >
                  <Download className="h-3.5 w-3.5" />
                  DOCX
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-foreground outline-none hover:bg-background-subtle focus:bg-background-subtle disabled:pointer-events-none disabled:opacity-50"
                  onSelect={() => void handleExport("pdf")}
                  disabled={isExporting || !hasAnyContent}
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* ── 3-panel body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Requirements sidebar — desktop inline (hidden on mobile via wrapper) */}
        <div className="hidden md:contents">
          <RequirementsSidebar
            requirements={requirements}
            selectedRequirementIds={selectedReqIds}
            onToggleRequirement={handleToggleRequirement}
            isLoading={isExtracting}
          />
        </div>

        {/* Center: editor — takes full width on mobile when sidebars are overlays */}
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

        {/* Right: Knowledge base search — desktop inline (collapsible via top-bar toggle) */}
        {showKbPanel && (
          <div className="hidden md:contents">
            <KBSearchPanel
              selectedKbItemIds={selectedKbIds}
              onToggleKbItem={handleToggleKbItem}
              onSearch={handleKbSearch}
            />
          </div>
        )}
      </div>

      {/* ── Mobile Requirements overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {showReqOverlay && (
          <motion.div
            key="req-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setShowReqOverlay(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Slide-in panel from left */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
              className="absolute left-0 top-0 h-full w-[min(320px,85vw)]"
              onClick={(e) => e.stopPropagation()}
            >
              <RequirementsSidebar
                requirements={requirements}
                selectedRequirementIds={selectedReqIds}
                onToggleRequirement={handleToggleRequirement}
                isLoading={isExtracting}
                className="w-full shadow-xl"
                onClose={() => setShowReqOverlay(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile KB overlay ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showKbOverlay && (
          <motion.div
            key="kb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setShowKbOverlay(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Slide-in panel from right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
              className="absolute right-0 top-0 h-full w-[min(320px,85vw)]"
              onClick={(e) => e.stopPropagation()}
            >
              <KBSearchPanel
                selectedKbItemIds={selectedKbIds}
                onToggleKbItem={handleToggleKbItem}
                onSearch={handleKbSearch}
                className="w-full shadow-xl border-l"
                onClose={() => setShowKbOverlay(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
