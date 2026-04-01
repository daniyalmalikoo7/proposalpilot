"use client";

// RFPUploadPanel — center-panel step shown when a proposal has no requirements yet.
// Presents a drag-and-drop zone; calls onUpload with the selected file.

import { useCallback, useRef, useState } from "react";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface RFPUploadPanelProps {
  readonly onUpload: (file: File) => void;
  readonly onSkip: () => void;
  readonly error: string | null;
  readonly onClearError: () => void;
}

export function RFPUploadPanel({
  onUpload,
  onSkip,
  error,
  onClearError,
}: RFPUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      onClearError();
      onUpload(file);
    },
    [onUpload, onClearError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  return (
    <div className="w-full max-w-xl space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          Upload your RFP to get started
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          ProposalPilot will extract requirements, organise them by section, and
          generate a tailored first draft.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-8 py-12 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
        )}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Upload RFP document"
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drop your RFP here or{" "}
            <span className="text-primary">browse files</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF or DOCX · up to 50 MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Skip option */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>No RFP yet?</span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={onSkip}
        >
          Start with a blank proposal
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="shrink-0 text-xs hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
