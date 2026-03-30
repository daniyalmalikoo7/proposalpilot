"use client";

// Proposal editor page — 3-panel layout:
//   Left  : Requirements sidebar (extracted RFP requirements)
//   Center: Stack of Tiptap section editors with per-section Generate buttons
//   Right : Knowledge base search panel for selecting AI context

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { RequirementsSidebar } from "@/components/organisms/requirements-sidebar";
import type { Requirement } from "@/components/organisms/requirements-sidebar";
import { KBSearchPanel } from "@/components/organisms/kb-search-panel";
import type { KBItem } from "@/components/organisms/kb-search-panel";
import { ProposalEditor } from "@/components/organisms/proposal-editor";
import type {
  ProposalSection,
  GenerateContext,
} from "@/components/organisms/proposal-editor";
import type { SectionGeneratorOutput } from "@/lib/ai/validators/section-generator-output";

// ── Hardcoded demo data (replace with tRPC queries once auth is wired) ─────

const DEMO_SECTIONS: ProposalSection[] = [
  { id: "s1", title: "Executive Summary", content: "", order: 1 },
  { id: "s2", title: "Technical Approach", content: "", order: 2 },
  { id: "s3", title: "Past Performance", content: "", order: 3 },
  { id: "s4", title: "Staffing Plan", content: "", order: 4 },
  { id: "s5", title: "Pricing", content: "", order: 5 },
];

const DEMO_REQUIREMENTS: Requirement[] = [
  {
    id: "r1",
    section: "Technical",
    requirement: "Demonstrate experience with cloud-native architectures",
    priority: "high",
    addressed: false,
  },
  {
    id: "r2",
    section: "Technical",
    requirement: "Describe approach to data security and compliance",
    priority: "high",
    addressed: false,
  },
  {
    id: "r3",
    section: "Management",
    requirement: "Provide key personnel resumes and qualifications",
    priority: "medium",
    addressed: false,
  },
  {
    id: "r4",
    section: "Past Performance",
    requirement: "Include three relevant contracts from the last 5 years",
    priority: "high",
    addressed: false,
  },
  {
    id: "r5",
    section: "Pricing",
    requirement: "Submit firm-fixed-price breakdown by task",
    priority: "medium",
    addressed: false,
  },
];

// ── Export helper ──────────────────────────────────────────────────────────

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

// ── Page component ─────────────────────────────────────────────────────────

export default function ProposalEditorPage() {
  const params = useParams<{ id: string }>();
  const proposalId = params.id;

  // In production these come from tRPC queries; demo data used here
  const ORG_ID = "demo-org";
  const [sections, setSections] = useState<ProposalSection[]>(DEMO_SECTIONS);
  const [requirements] = useState<Requirement[]>(DEMO_REQUIREMENTS);

  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(new Set());
  const [selectedKbIds, setSelectedKbIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Toggle requirement selection for AI context
  const handleToggleRequirement = useCallback((id: string) => {
    setSelectedReqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Toggle KB item selection
  const handleToggleKbItem = useCallback((id: string) => {
    setSelectedKbIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // KB search (calls tRPC kb.search in production)
  const handleKbSearch = useCallback(
    async (query: string): Promise<KBItem[]> => {
      // Demo: return empty — replace with trpc.kb.search.query({ orgId: ORG_ID, query })
      void query;
      return [];
    },
    [],
  );

  // Auto-save section content
  const handleContentChange = useCallback((sectionId: string, html: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, content: html } : s)),
    );
    // Production: trpc.proposal.updateSection.mutate({ sectionId, proposalId, orgId: ORG_ID, content: html })
  }, []);

  // Handle generation complete — update section + confidence
  const handleGenerateComplete = useCallback(
    (sectionId: string, output: SectionGeneratorOutput) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, confidenceScore: output.confidence_score }
            : s,
        ),
      );
    },
    [],
  );

  // Export handler
  const handleExport = useCallback(
    async (format: "pdf" | "docx") => {
      setIsExporting(true);
      try {
        // Production: trpc.proposal.export.mutate({ id: proposalId, orgId: ORG_ID, format })
        // Demo: call export endpoint directly
        const response = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposalId, orgId: ORG_ID, format }),
        });
        if (!response.ok) throw new Error("Export failed");
        const json = (await response.json()) as {
          downloadUrl: string;
          filename: string;
        };
        downloadDataUrl(json.downloadUrl, json.filename);
      } catch {
        // In production show a toast; demo silently fails
      } finally {
        setIsExporting(false);
      }
    },
    [proposalId],
  );

  // Build generate context using currently selected requirements + KB items
  const selectedRequirementTexts = useMemo(
    () =>
      requirements
        .filter((r) => selectedReqIds.has(r.id))
        .map((r) => r.requirement),
    [requirements, selectedReqIds],
  );

  const generateContext: GenerateContext = useMemo(
    () => ({
      proposalId,
      orgId: ORG_ID,
      requirements: selectedRequirementTexts,
      kbItemIds: Array.from(selectedKbIds),
    }),
    [proposalId, selectedKbIds, selectedRequirementTexts],
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-sm font-semibold text-foreground">
            Proposal Editor
          </h1>
          <span className="text-xs text-muted-foreground">
            #{proposalId.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleExport("docx")}
            disabled={isExporting}
            className="h-8 gap-1.5 text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export DOCX
          </Button>
          <Button
            size="sm"
            onClick={() => void handleExport("pdf")}
            disabled={isExporting}
            className="h-8 gap-1.5 text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Requirements */}
        <RequirementsSidebar
          requirements={requirements}
          selectedRequirementIds={selectedReqIds}
          onToggleRequirement={handleToggleRequirement}
        />

        {/* Center: Section editors */}
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto bg-background p-4">
          {sections.map((section) => (
            <ProposalEditor
              key={section.id}
              section={section}
              generateContext={generateContext}
              onContentChange={handleContentChange}
              onGenerateComplete={handleGenerateComplete}
            />
          ))}
        </main>

        {/* Right: KB search */}
        <KBSearchPanel
          selectedKbItemIds={selectedKbIds}
          onToggleKbItem={handleToggleKbItem}
          onSearch={handleKbSearch}
        />
      </div>
    </div>
  );
}
