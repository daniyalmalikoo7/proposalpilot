"use client";

// EditorCenterPanel — renders one of four states in the proposal editor's center column:
//   1. Extraction progress (uploading / extracting) — highest priority
//   2. Stacked ProposalEditor instances (sections exist)
//   3. "Generate All Sections" CTA (requirements exist, no sections yet)
//   4. RFP upload zone (nothing yet)

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ProposalEditor } from "@/components/organisms/proposal-editor";
import type {
  ProposalSection,
  GenerateContext,
} from "@/components/organisms/proposal-editor";
import type { Requirement } from "@/components/organisms/requirements-sidebar";
import type { SectionGeneratorOutput } from "@/lib/ai/validators/section-generator-output";
import { RFPUploadPanel } from "./rfp-upload-panel";
import type { ExtractionPhase } from "./use-proposal-editor";

interface EditorCenterPanelProps {
  readonly hasRequirements: boolean;
  readonly hasSections: boolean;
  readonly isExtracting: boolean;
  readonly extractionPhase: ExtractionPhase;
  readonly extractionError: string | null;
  readonly requirements: Requirement[];
  readonly sections: ProposalSection[];
  readonly pendingGenQueue: string[];
  readonly activePendingGenId: string | null;
  readonly isCreatingSections: boolean;
  readonly generateContext: GenerateContext;
  readonly selectedReqIds: ReadonlySet<string>;
  readonly onRFPUpload: (file: File) => void;
  readonly onSkipRFP: () => void;
  readonly onClearError: () => void;
  readonly onGenerateAll: () => void;
  readonly onContentChange: (sectionId: string, html: string) => void;
  readonly onGenerateComplete: (
    sectionId: string,
    output: SectionGeneratorOutput,
    html: string,
  ) => void;
  readonly onSelectAllRequirements: () => void;
}

export function EditorCenterPanel({
  hasRequirements,
  hasSections,
  isExtracting,
  extractionPhase,
  extractionError,
  requirements,
  sections,
  pendingGenQueue,
  activePendingGenId,
  isCreatingSections,
  generateContext,
  selectedReqIds,
  onRFPUpload,
  onSkipRFP,
  onClearError,
  onGenerateAll,
  onContentChange,
  onGenerateComplete,
  onSelectAllRequirements,
}: EditorCenterPanelProps) {
  // Step 1: currently extracting → progress (highest priority)
  if (isExtracting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3" role="status" aria-live="polite">
        <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--accent))]" />
        <p className="text-sm font-medium">
          {extractionPhase === "uploading"
            ? "Uploading RFP…"
            : "Extracting requirements from your RFP…"}
        </p>
        <p className="text-xs text-foreground-muted">
          This usually takes 15–30 seconds
        </p>
      </div>
    );
  }

  // Step 2: no requirements, no sections, idle → upload zone
  if (!hasRequirements && !hasSections) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <RFPUploadPanel
          onUpload={onRFPUpload}
          onSkip={onSkipRFP}
          error={extractionError}
          onClearError={onClearError}
        />
      </div>
    );
  }

  // Step 3: requirements exist but no sections yet → generate CTA
  if (hasRequirements && !hasSections) {
    const sectionCount = [...new Set(requirements.map((r) => r.section))]
      .length;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8">
        <div className="text-center">
          <p className="text-lg font-semibold">Requirements extracted</p>
          <p className="mt-1.5 text-sm text-foreground-muted">
            {requirements.length} requirement
            {requirements.length !== 1 ? "s" : ""} across {sectionCount} section
            {sectionCount !== 1 ? "s" : ""} found. Review them in the left
            sidebar, then generate your draft.
          </p>
        </div>
        <Button size="lg" onClick={onGenerateAll} disabled={isCreatingSections}>
          {isCreatingSections ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating sections…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate All Sections
            </>
          )}
        </Button>
      </div>
    );
  }

  // Step 4: sections exist → stacked editors
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background-elevated/50 px-4 py-2">
        <p className="text-xs text-foreground-muted">
          {pendingGenQueue.length > 0
            ? `Generating section ${sections.length - pendingGenQueue.length + 1} of ${sections.length}…`
            : `${sections.length} section${sections.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-2">
          {selectedReqIds.size === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onSelectAllRequirements}
            >
              Select all requirements
            </Button>
          )}
          {sections.some((s) => !s.content.trim()) && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={onGenerateAll}
              disabled={pendingGenQueue.length > 0}
            >
              <Sparkles className="h-3 w-3" />
              Generate all
            </Button>
          )}
        </div>
      </div>

      {/* Section editors */}
      <div className="flex flex-col gap-6 overflow-y-auto p-4">
        {sections.map((section) => (
          <ProposalEditor
            key={section.id}
            section={section}
            generateContext={generateContext}
            onContentChange={onContentChange}
            onGenerateComplete={onGenerateComplete}
            autoGenerate={section.id === activePendingGenId}
          />
        ))}
      </div>
    </div>
  );
}
