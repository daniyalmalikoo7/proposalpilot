"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { trpc } from "@/lib/trpc/client";

const KB_TYPES = [
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "PAST_PROPOSAL", label: "Past Proposal" },
  { value: "METHODOLOGY", label: "Methodology" },
  { value: "TEAM_BIO", label: "Team Bio" },
  { value: "CAPABILITY", label: "Capability" },
  { value: "OTHER", label: "Other" },
] as const;

type KBType = (typeof KB_TYPES)[number]["value"];

interface KBUploadFormProps {
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

export function KBUploadForm({ onSuccess, onCancel }: KBUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KBType>("CASE_STUDY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  async function handleSubmit() {
    if (!file || !title.trim() || isProcessing) return;

    setError(null);
    setIsProcessing(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      form.append("title", title.trim());

      const res = await fetch("/api/upload/kb", { method: "POST", body: form });
      const json = (await res.json()) as {
        ok: boolean;
        data?: { documentId: string; chunkCount: number };
        error?: { code: string; message: string };
      };

      if (!json.ok) {
        setError(json.error?.message ?? "Upload failed.");
        return;
      }

      await utils.kb.list.invalidate();
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Upload Document</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCancel}
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {/* File picker */}
        <div>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Upload className="h-4 w-4 shrink-0" />
            {file ? (
              <span className="min-w-0 truncate font-medium text-foreground">
                {file.name}
              </span>
            ) : (
              <span>Click or drop a PDF, DOCX, or TXT file</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
              }
            }}
          />
        </div>

        {file && (
          <div className="flex gap-3">
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as KBType)}
                disabled={isProcessing}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              >
                {KB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                disabled={isProcessing}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {file && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={!title.trim() || isProcessing}
            >
              {isProcessing && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isProcessing ? "Processing…" : "Add to Knowledge Base"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
