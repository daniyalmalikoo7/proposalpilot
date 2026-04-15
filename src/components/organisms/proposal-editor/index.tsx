"use client";

// ProposalEditor — Tiptap-based rich text editor for a single proposal section.
// Streams AI-generated content from /api/ai/stream-section via SSE.

import { AnimatePresence, motion } from "framer-motion";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  BookOpen,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Zap,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { trpc } from "@/lib/trpc/client";
import { EditorToolbar } from "./editor-toolbar";
import { useSectionGeneration } from "./use-section-generation";
import { markdownToHtml } from "./markdown-to-html";
import type { ProposalSection, GenerateContext } from "./types";
import type { SectionGeneratorOutput } from "@/lib/ai/validators/section-generator-output";

export type { ProposalSection, GenerateContext };

// ── Error boundary ──────────────────────────────────────────────────────────
class EditorErrorBoundary extends Component<
  { readonly children: ReactNode; readonly title: string },
  { readonly hasError: boolean }
> {
  constructor(props: { readonly children: ReactNode; readonly title: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ProposalEditor] Section "${this.props.title}" crashed:`,
      error,
      info.componentStack,
    );
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Section &ldquo;{this.props.title}&rdquo; could not be rendered.
            Refresh to retry.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ProposalEditorProps {
  readonly section: ProposalSection;
  readonly generateContext: GenerateContext;
  readonly onContentChange: (sectionId: string, html: string) => void;
  readonly onGenerateComplete?: (
    sectionId: string,
    output: SectionGeneratorOutput,
    html: string,
  ) => void;
  readonly autoSaveDelayMs?: number;
  readonly autoGenerate?: boolean;
}

function ConfidenceBadge({ score }: { readonly score: number }) {
  const pct = Math.round(score * 100);
  const variant =
    score > 0.7 ? "success" : score >= 0.4 ? "warning" : "danger";
  return (
    <Badge variant={variant} className="rounded-full px-2 py-0.5 text-xs font-medium">
      {pct}% confidence
    </Badge>
  );
}

/**
 * Lightweight markdown → HTML for streaming preview.
 * Only converts patterns where both delimiters are present on the same line,
 * so partial/unclosed markdown at the stream boundary renders as plain text
 * rather than leaking raw syntax into the editor.
 */
function streamingMarkdownToHtml(md: string): string {
  if (!md) return "";
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim();
      if (!t) return "";
      if (/^<[hul]/.test(t)) return t;
      return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function getConfidenceBorderClass(score: number | null): string {
  if (score === null) return "border-l-4 border-l-transparent";
  if (score > 0.7) return "border-l-4 border-l-success";
  if (score >= 0.4) return "border-l-4 border-l-warning";
  return "border-l-4 border-l-danger";
}

function ProposalEditorInner({
  section,
  generateContext,
  onContentChange,
  onGenerateComplete,
  autoSaveDelayMs = 1500,
  autoGenerate = false,
}: ProposalEditorProps) {
  const [confidenceScore, setConfidenceScore] = useState<number | null>(
    section.confidenceScore ?? null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const utils = trpc.useUtils();
  const deleteSectionMutation = trpc.proposal.deleteSection.useMutation({
    onSuccess: () => {
      void utils.proposal.get.invalidate({ id: generateContext.proposalId });
    },
  });
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoGenerateFiredRef = useRef(false);
  // Ref so the stale onUpdate closure can read the latest isGenerating value
  const isGeneratingRef = useRef(false);
  // Typewriter animation: tracks how many characters have been revealed so far.
  // The interval reads streamBufferRef (always current) so it doesn't need to
  // be restarted on every chunk arrival.
  const revealedLengthRef = useRef(0);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamBufferRef = useRef("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Write the "${section.title}" section…`,
      }),
    ],
    content: section.content
      ? section.content.trimStart().startsWith("<")
        ? section.content
        : markdownToHtml(section.content)
      : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] h-auto px-6 py-4 text-base leading-relaxed",
      },
    },
    onUpdate: ({ editor: ed }) => {
      // Don't debounce-save while streaming — content changes every chunk.
      // handleGenerateComplete calls onContentChange directly after the stream.
      if (isGeneratingRef.current) return;
      const html = ed.getHTML();
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        onContentChange(section.id, html);
      }, autoSaveDelayMs);
    },
  });

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const handleGenerateComplete = useCallback(
    (html: string, output: SectionGeneratorOutput) => {
      // Stop the typewriter before setting final content so the interval
      // cannot overwrite the full markdownToHtml result with a partial frame.
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
      editor?.commands.setContent(html);
      onContentChange(section.id, html);
      setConfidenceScore(output.confidence_score);
      onGenerateComplete?.(section.id, output, html);
    },
    [editor, onContentChange, onGenerateComplete, section.id],
  );

  const { isGenerating, streamBuffer, error, start, cancel, clearError } =
    useSectionGeneration({
      sectionId: section.id,
      sectionTitle: section.title,
      generateContext,
      onComplete: handleGenerateComplete,
    });

  // Keep refs in sync during render so stale closures (onUpdate, typewriter) see them
  isGeneratingRef.current = isGenerating;
  streamBufferRef.current = streamBuffer;

  // Typewriter animation: reveals streamed content character-by-character (~30 chars
  // per frame at 60fps = ~1800 chars/s) regardless of how large Gemini's chunks are.
  //
  // The interval reads streamBufferRef.current (updated every render) so it doesn't
  // need to be torn down and restarted on every chunk arrival — it simply catches up
  // to the latest buffer length on each tick.
  //
  // Lifecycle:
  //   isGenerating=true,  streamBuffer=""  → show animated placeholder
  //   isGenerating=true,  streamBuffer!=="" → start interval (if not running)
  //   isGenerating=false                   → clear interval + reset length
  useEffect(() => {
    if (!isGenerating || !editor) {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
      revealedLengthRef.current = 0;
      return;
    }

    if (!streamBuffer) {
      // Generation started but no tokens yet — show placeholder once
      revealedLengthRef.current = 0;
      editor.commands.setContent(
        '<p class="animate-pulse text-foreground-muted">✦ Generating proposal content…</p>',
      );
      return;
    }

    // Interval already running — it will pick up new content via streamBufferRef
    if (typewriterRef.current) return;

    typewriterRef.current = setInterval(() => {
      const target = streamBufferRef.current;
      // Caught up with current buffer — wait for the next chunk without a render
      if (revealedLengthRef.current >= target.length) return;
      const next = Math.min(revealedLengthRef.current + 30, target.length);
      revealedLengthRef.current = next;
      editor.commands.setContent(
        streamingMarkdownToHtml(target.slice(0, next)),
      );
    }, 16); // ~60 fps
  }, [isGenerating, streamBuffer, editor]);

  useEffect(() => {
    if (autoGenerate && !autoGenerateFiredRef.current && !isGenerating) {
      autoGenerateFiredRef.current = true;
      void start();
    }
    if (!autoGenerate) {
      autoGenerateFiredRef.current = false;
    }
  }, [autoGenerate, isGenerating, start]);

  return (
    <div
      id={`section-${section.id}`}
      role="region"
      aria-label={section.title}
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-background-elevated transition-shadow hover:shadow-md",
        getConfidenceBorderClass(confidenceScore),
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background-subtle/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{section.title}</h3>
          {confidenceScore !== null && (
            <ConfidenceBadge score={confidenceScore} />
          )}
          {generateContext.kbItemIds.length > 0 && (
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <BookOpen className="h-3 w-3" />
              {generateContext.kbItemIds.length} KB
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="h-7 w-7 p-0 text-foreground-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
            aria-label={`Delete ${section.title} section`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  disabled
                  className="h-7 gap-1.5 text-xs opacity-40"
                >
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancel}
                  className="relative h-7 gap-1.5 overflow-hidden text-xs"
                >
                  <span className="absolute inset-0 animate-pulse bg-[hsl(var(--accent))]/10" />
                  <Zap className="relative h-3 w-3 text-[hsl(var(--accent))]" />
                  <span className="relative">Generating…</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                {section.content && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void start()}
                            className="h-7 gap-1.5 text-xs"
                            disabled={generateContext.requirements.length === 0}
                            aria-label="Regenerate this section"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Regenerate
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {generateContext.requirements.length === 0 && (
                        <TooltipContent side="bottom">
                          Upload an RFP or add requirements to regenerate content
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          size="sm"
                          onClick={() => void start()}
                          className="h-7 gap-1.5 text-xs"
                          disabled={generateContext.requirements.length === 0}
                          aria-label="Generate this section"
                        >
                          <Sparkles className="h-3 w-3" />
                          Generate
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {generateContext.requirements.length === 0 && (
                      <TooltipContent side="bottom">
                        Upload an RFP or add requirements to generate content
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <EditorToolbar editor={editor} />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 border-b border-danger/20 bg-danger-bg px-4 py-2 text-xs text-danger">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="ml-auto hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor — always mounted; aria-live announces streaming updates to screen readers */}
      <div
        aria-live="polite"
        aria-busy={isGenerating}
        aria-label={`${section.title} content`}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background-elevated/95 p-6 backdrop-blur-sm">
          <p className="text-center text-sm font-medium">Delete &ldquo;{section.title}&rdquo;?</p>
          <p className="text-center text-xs text-foreground-muted">This cannot be undone.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              disabled={deleteSectionMutation.isPending}
              onClick={() => deleteSectionMutation.mutate({ sectionId: section.id, proposalId: generateContext.proposalId })}
            >
              {deleteSectionMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProposalEditor(props: ProposalEditorProps) {
  return (
    <EditorErrorBoundary title={props.section.title}>
      <ProposalEditorInner {...props} />
    </EditorErrorBoundary>
  );
}
