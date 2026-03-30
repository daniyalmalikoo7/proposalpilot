"use client";

// Proposal editor page — 3-panel layout:
//   Left  : Requirements sidebar (extracted RFP requirements)
//   Center: Stack of Tiptap section editors with per-section Generate buttons
//   Right : Knowledge base search panel for selecting AI context

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
import { trpc } from "@/lib/trpc/client";

// ── Debounce helper ───────────────────────────────────────────────────────

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delayMs: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(
        () => callbackRef.current(...args),
        delayMs,
      );
    },
    [delayMs],
  ) as T;
}

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
  const { orgId } = useAuth();

  // Fetch proposal data via tRPC
  const proposalQuery = trpc.proposal.get.useQuery(
    { id: proposalId, orgId: orgId ?? "" },
    { enabled: Boolean(orgId) },
  );

  // Mutation for auto-saving sections
  const updateSectionMutation = trpc.proposal.updateSection.useMutation();

  // tRPC utils for imperative queries
  const trpcUtils = trpc.useUtils();

  // Local sections state (synced from server data)
  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(new Set());
  const [selectedKbIds, setSelectedKbIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Sync server data into local state when it loads
  useEffect(() => {
    if (proposalQuery.data?.sections) {
      setSections(
        proposalQuery.data.sections.map((s) => ({
          id: s.id,
          title: s.title,
          content: s.content,
          order: s.order,
          confidenceScore: null,
        })),
      );
    }
  }, [proposalQuery.data?.sections]);

  // Map requirements from server data
  const requirements: Requirement[] = useMemo(() => {
    if (!proposalQuery.data?.requirements) return [];
    return proposalQuery.data.requirements.map((r) => ({
      id: r.id,
      section: r.section ?? "General",
      requirement: r.requirement,
      priority: (r.priority ?? "medium") as "high" | "medium" | "low",
      addressed: r.addressed ?? false,
    }));
  }, [proposalQuery.data?.requirements]);

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

  // KB search
  const handleKbSearch = useCallback(
    async (query: string): Promise<KBItem[]> => {
      if (!orgId) return [];
      const results = await trpcUtils.kb.search.fetch({
        orgId,
        query,
        limit: 5,
      });
      return results.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        content: r.content,
      }));
    },
    [orgId, trpcUtils.kb.search],
  );

  // Debounced auto-save section content
  const debouncedSave = useDebouncedCallback(
    (sectionId: string, content: string) => {
      if (!orgId) return;
      updateSectionMutation.mutate({
        sectionId,
        proposalId,
        orgId,
        content,
      });
    },
    1000,
  );

  // Auto-save section content
  const handleContentChange = useCallback(
    (sectionId: string, html: string) => {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, content: html } : s)),
      );
      debouncedSave(sectionId, html);
    },
    [debouncedSave],
  );

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
  const exportMutation = trpc.proposal.export.useMutation();
  const handleExport = useCallback(
    async (format: "pdf" | "docx") => {
      if (!orgId) return;
      setIsExporting(true);
      try {
        const result = await exportMutation.mutateAsync({
          id: proposalId,
          orgId,
          format,
        });
        downloadDataUrl(result.downloadUrl, result.filename);
      } catch {
        // Toast notification would go here in production
      } finally {
        setIsExporting(false);
      }
    },
    [proposalId, orgId, exportMutation],
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
      orgId: orgId ?? "",
      requirements: selectedRequirementTexts,
      kbItemIds: Array.from(selectedKbIds),
    }),
    [proposalId, orgId, selectedKbIds, selectedRequirementTexts],
  );

  if (!orgId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Select an organization to continue.
        </p>
      </div>
    );
  }

  if (proposalQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (proposalQuery.error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">
          Failed to load proposal. {proposalQuery.error.message}
        </p>
      </div>
    );
  }

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
