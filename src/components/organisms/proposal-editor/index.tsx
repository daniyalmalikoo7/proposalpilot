"use client";

// ProposalEditor — Tiptap-based rich text editor for a single proposal section.
// Streams AI-generated content from /api/ai/stream-section via SSE.

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Loader2, Sparkles, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { EditorToolbar } from "./editor-toolbar";
import { useSectionGeneration } from "./use-section-generation";
import { markdownToHtml } from "./markdown-to-html";
import type { ProposalSection, GenerateContext } from "./types";
import type { SectionGeneratorOutput } from "@/lib/ai/validators/section-generator-output";

export type { ProposalSection, GenerateContext };

interface ProposalEditorProps {
  readonly section: ProposalSection;
  readonly generateContext: GenerateContext;
  readonly onContentChange: (sectionId: string, html: string) => void;
  readonly onGenerateComplete?: (
    sectionId: string,
    output: SectionGeneratorOutput,
  ) => void;
  readonly autoSaveDelayMs?: number;
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

export function ProposalEditor({
  section,
  generateContext,
  onContentChange,
  onGenerateComplete,
  autoSaveDelayMs = 1500,
}: ProposalEditorProps) {
  const [confidenceScore, setConfidenceScore] = useState<number | null>(
    section.confidenceScore ?? null,
  );
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Write the "${section.title}" section…`,
      }),
    ],
    content: section.content ? markdownToHtml(section.content) : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-6 py-4",
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
      onGenerateComplete?.(section.id, output);
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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {section.title}
          </h3>
          {confidenceScore !== null && (
            <ConfidenceBadge score={confidenceScore} />
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void start()}
                  className="h-7 gap-1.5 text-xs"
                  title="Regenerate this section"
                >
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => void start()}
                className="h-7 gap-1.5 text-xs"
                disabled={generateContext.requirements.length === 0}
                title={
                  generateContext.requirements.length === 0
                    ? "Select requirements from the sidebar first"
                    : "Generate this section with AI"
                }
              >
                <Sparkles className="h-3 w-3" />
                Generate
              </Button>
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
      <div className="relative flex-1 overflow-y-auto">
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
