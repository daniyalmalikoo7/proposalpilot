"use client";

// useProposalEditor — encapsulates all state, mutations, and handlers for the
// proposal editor page. Keeps page.tsx thin (render-only).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Requirement } from "@/components/organisms/requirements-sidebar";
import type { KBItem } from "@/components/organisms/kb-search-panel";
import type {
  ProposalSection,
  GenerateContext,
} from "@/components/organisms/proposal-editor";
import type { SectionGeneratorOutput } from "@/lib/ai/validators/section-generator-output";
import { trpc } from "@/lib/trpc/client";

export type SaveState = "idle" | "saving" | "saved";
export type ExtractionPhase = "idle" | "uploading" | "extracting";

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delayMs: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(callback);
  cbRef.current = callback;
  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => cbRef.current(...args), delayMs);
    },
    [delayMs],
  ) as T;
}

export function useProposalEditor(proposalId: string) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const proposalQuery = trpc.proposal.get.useQuery({ id: proposalId });
  const utils = trpc.useUtils();

  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(new Set());
  const [selectedKbIds, setSelectedKbIds] = useState<Set<string>>(new Set());
  const [pendingGenQueue, setPendingGenQueue] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [extractionPhase, setExtractionPhase] =
    useState<ExtractionPhase>("idle");
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync sections from server query
  useEffect(() => {
    if (proposalQuery.data?.sections) {
      setSections(
        proposalQuery.data.sections.map((s) => ({
          id: s.id,
          title: s.title,
          content: s.content,
          order: s.order,
          confidenceScore: s.confidenceScore ?? null,
        })),
      );
    }
  }, [proposalQuery.data?.sections]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const requirements: Requirement[] = useMemo(() => {
    if (!proposalQuery.data?.requirements) return [];
    return proposalQuery.data.requirements.map((r) => {
      const reqSection = r.section ?? "General";
      const matchingSection = sections.find((s) => s.title === reqSection);
      const sectionHasContent = Boolean(matchingSection?.content?.trim());
      return {
        id: r.id,
        section: reqSection,
        requirement: r.requirement,
        priority: (r.priority ?? "medium") as "high" | "medium" | "low",
        addressed: (r.addressed ?? false) || sectionHasContent,
      };
    });
  }, [proposalQuery.data?.requirements, sections]);

  const hasRequirements = requirements.length > 0;
  const hasSections = sections.length > 0;
  const hasAnyContent = sections.some((s) => s.content.trim() !== "");
  const isExtracting = extractionPhase !== "idle";
  const activePendingGenId = pendingGenQueue[0] ?? null;

  const selectedRequirements = useMemo(
    () => requirements.filter((r) => selectedReqIds.has(r.id)),
    [requirements, selectedReqIds],
  );

  const selectedRequirementTexts = useMemo(
    () => selectedRequirements.map((r) => r.requirement),
    [selectedRequirements],
  );

  const requirementsBySection = useMemo(
    () =>
      selectedRequirements.reduce<Record<string, string[]>>((acc, r) => {
        (acc[r.section] ??= []).push(r.requirement);
        return acc;
      }, {}),
    [selectedRequirements],
  );

  const generateContext: GenerateContext = useMemo(
    () => ({
      proposalId,
      requirements: selectedRequirementTexts,
      requirementsBySection,
      kbItemIds: Array.from(selectedKbIds),
    }),
    [
      proposalId,
      selectedRequirementTexts,
      requirementsBySection,
      selectedKbIds,
    ],
  );

  // ── Mutations ────────────────────────────────────────────────────────────────
  const updateSectionMutation = trpc.proposal.updateSection.useMutation({
    onMutate: () => setSaveState("saving"),
    onSuccess: () => {
      setSaveState("saved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveState("idle"), 2500);
    },
    onError: () => setSaveState("idle"),
  });

  const extractReqMutation = trpc.ai.extractRequirements.useMutation();
  const createSectionMutation = trpc.proposal.createSection.useMutation();
  const exportMutation = trpc.proposal.export.useMutation();

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const debouncedSave = useDebouncedCallback(
    (sectionId: string, content: string) => {
      updateSectionMutation.mutate({ sectionId, proposalId, content });
    },
    1000,
  );

  const handleContentChange = useCallback(
    (sectionId: string, html: string) => {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, content: html } : s)),
      );
      debouncedSave(sectionId, html);
    },
    [debouncedSave],
  );

  const handleGenerateComplete = useCallback(
    (sectionId: string, output: SectionGeneratorOutput, html: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, confidenceScore: output.confidence_score }
            : s,
        ),
      );
      setPendingGenQueue((prev) => prev.filter((id) => id !== sectionId));
      // Persist confidence to DB. debouncedSave (triggered by onContentChange)
      // only carries content — it omits confidenceScore so it won't overwrite this.
      updateSectionMutation.mutate({
        sectionId,
        proposalId,
        content: html,
        confidenceScore: output.confidence_score,
      });
    },
    [proposalId, updateSectionMutation],
  );

  const handleToggleRequirement = useCallback(
    (id: string) => {
      setSelectedReqIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      // Scroll to the matching section editor when toggling a requirement
      const req = requirements.find((r) => r.id === id);
      if (req) {
        const section = sections.find((s) => s.title === req.section);
        if (section) {
          document
            .getElementById(`section-${section.id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    },
    [requirements, sections],
  );

  const handleToggleKbItem = useCallback((id: string) => {
    setSelectedKbIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleKbSearch = useCallback(
    async (query: string): Promise<KBItem[]> => {
      const results = await utils.kb.search.fetch({ query, limit: 5 });
      return results.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        content: r.content,
      }));
    },
    [utils.kb.search],
  );

  const handleRFPUpload = useCallback(
    async (file: File) => {
      setExtractionPhase("uploading");
      setExtractionError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token = await getTokenRef.current();
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        const json = (await res.json()) as {
          ok: boolean;
          data?: { chunks: { text: string }[] };
          error?: { message: string };
        };
        if (!json.ok || !json.data) {
          setExtractionError(json.error?.message ?? "Upload failed.");
          setExtractionPhase("idle");
          return;
        }
        const rfpText = json.data.chunks.map((c) => c.text).join("\n\n");
        setExtractionPhase("extracting");
        await extractReqMutation.mutateAsync({ proposalId, rfpText });
        await utils.proposal.get.invalidate({ id: proposalId });
        setExtractionPhase("idle");
      } catch (err) {
        setExtractionError(
          err instanceof Error ? err.message : "Extraction failed.",
        );
        setExtractionPhase("idle");
      }
    },
    [proposalId, extractReqMutation, utils.proposal.get, getTokenRef],
  );

  // Skip RFP upload — create a single blank section so the editor is usable.
  const handleSkipRFP = useCallback(async () => {
    try {
      await createSectionMutation.mutateAsync({
        proposalId,
        title: "Proposal",
        order: 0,
      });
      await utils.proposal.get.invalidate({ id: proposalId });
    } catch {
      // ignore — user can try again
    }
  }, [proposalId, createSectionMutation, utils.proposal.get]);

  const handleGenerateAll = useCallback(async () => {
    setSelectedReqIds(new Set(requirements.map((r) => r.id)));
    let sectionIds: string[];
    if (!hasSections) {
      const titles = [...new Set(requirements.map((r) => r.section))];
      try {
        const created = await Promise.all(
          titles.map((title, i) =>
            createSectionMutation.mutateAsync({ proposalId, title, order: i }),
          ),
        );
        sectionIds = created.map((s) => s.id);
        await utils.proposal.get.invalidate({ id: proposalId });
      } catch {
        return;
      }
    } else {
      sectionIds = sections.filter((s) => !s.content.trim()).map((s) => s.id);
    }
    if (sectionIds.length > 0) setPendingGenQueue(sectionIds);
  }, [
    requirements,
    hasSections,
    sections,
    proposalId,
    createSectionMutation,
    utils.proposal.get,
  ]);

  const handleExport = useCallback(
    async (format: "pdf" | "docx") => {
      setIsExporting(true);
      try {
        const result = await exportMutation.mutateAsync({
          id: proposalId,
          format,
        });
        const a = document.createElement("a");
        a.href = result.downloadUrl;
        a.download = result.filename;
        a.click();
      } finally {
        setIsExporting(false);
      }
    },
    [proposalId, exportMutation],
  );

  return {
    proposalQuery,
    proposal: proposalQuery.data,
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
    isCreatingSections: createSectionMutation.isPending,
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
  };
}
