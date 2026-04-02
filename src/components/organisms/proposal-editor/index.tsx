"use client";

// ProposalEditor — Tiptap-based rich text editor for a single proposal section.
// Streams AI-generated content from /api/ai/stream-section via SSE.

import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  BookOpen,
  Loader2,
  Sparkles,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { EditorToolbar } from "./editor-toolbar";
import { useSectionGeneration } from "./use-section-generation";
import { markdownToHtml } from "./markdown-to-html";
import type { ProposalSection, GenerateContext } from "./types";
import type { SectionGeneratorOutput } from "@/lib/ai/validators/section-generator-output";

export type { ProposalSection, GenerateContext };

// ── Error boundary ──────────────────────────────────────────────────────────
// Wraps each section editor so one bad section can't crash the whole page.
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
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
  /** When true, starts generation automatically (once). Used by "Generate All". */
  readonly autoGenerate?: boolean;
}

function ConfidenceBadge({ score }: { readonly score: number }) {
  const pct = Math.round(score * 100);
  const variant: "default" | "secondary" | "outline" =
    score >= 0.9 ? "default" : score >= 0.7 ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="text-xs">
      {pct}% confidence
    </Badge>
  );
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
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks whether the auto-generate has already fired for this activation,
  // preventing double-fires when deps change during an active generation.
  const autoGenerateFiredRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Write the "${section.title}" section…`,
      }),
    ],
    // Detect format: DB-saved content starts with "<" (HTML from editor.getHTML()).
    // AI-streamed content that hasn't been edited yet is markdown — convert it.
    content: section.content
      ? section.content.trimStart().startsWith("<")
        ? section.content
        : markdownToHtml(section.content)
      : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] h-auto px-6 py-4",
      },
    },
    onUpdate: ({ editor: ed }) => {
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

  // Drive "Generate All" queue: fire once when autoGenerate flips to true.
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
    <div className="flex flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {section.title}
          </h3>
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
          {isGenerating ? (
            <Button
              size="sm"
              variant="outline"
              onClick={cancel}
              className="h-7 gap-1.5 text-xs"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating…
            </Button>
          ) : (
            <>
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
                          title="Regenerate this section"
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
                    {/* span wrapper required — disabled buttons suppress mouse events needed for tooltip hover */}
                    <span className="inline-flex">
                      <Button
                        size="sm"
                        onClick={() => void start()}
                        className="h-7 gap-1.5 text-xs"
                        disabled={generateContext.requirements.length === 0}
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
            </>
          )}
        </div>
      </div>

      <EditorToolbar editor={editor} />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-4 py-2 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="ml-auto hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stream preview */}
      {isGenerating && streamBuffer && (
        <div className="border-b border-border bg-muted/50 px-6 py-2">
          <p className="line-clamp-2 font-mono text-xs text-muted-foreground">
            {streamBuffer.slice(-200)}
            <span className="animate-pulse">▋</span>
          </p>
        </div>
      )}

      {/* Editor area */}
      <div className="relative">
        {isGenerating && !streamBuffer && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating section…
            </div>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/** Public export — wraps the inner editor with a per-section error boundary. */
export function ProposalEditor(props: ProposalEditorProps) {
  return (
    <EditorErrorBoundary title={props.section.title}>
      <ProposalEditorInner {...props} />
    </EditorErrorBoundary>
  );
}
