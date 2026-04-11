"use client";

import { useRef, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Loader2, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

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
    <div className="rounded-lg border border-border bg-background-elevated p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Upload Document</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCancel}
          disabled={isProcessing}
          aria-label="Close upload form"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {/* File picker */}
        <div>
          <button
            type="button"
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-4 py-4 text-sm text-foreground-muted transition-colors",
              "hover:border-[hsl(var(--accent-hover))] hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
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
            {/* Type selector — Radix Select replaces raw <select> */}
            <div className="space-y-1.5">
              <label htmlFor="kb-type" className="block text-xs font-medium text-foreground-muted">
                Type
              </label>
              <Select.Root
                value={type}
                onValueChange={(v) => setType(v as KBType)}
                disabled={isProcessing}
              >
                <Select.Trigger
                  id="kb-type"
                  className={cn(
                    "flex h-10 items-center justify-between rounded-md border border-border bg-background px-3 text-sm shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
                    "disabled:opacity-50",
                    "min-w-[140px] gap-2",
                  )}
                >
                  <Select.Value />
                  <Select.Icon>
                    <ChevronDown className="h-4 w-4 text-foreground-muted" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content
                    className="z-50 min-w-[140px] overflow-hidden rounded-md border border-border bg-background-elevated shadow-md"
                    position="popper"
                    sideOffset={4}
                  >
                    <Select.Viewport className="p-1">
                      {KB_TYPES.map((t) => (
                        <Select.Item
                          key={t.value}
                          value={t.value}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded px-3 py-1.5 text-sm outline-none",
                            "hover:bg-background-subtle focus:bg-background-subtle",
                          )}
                        >
                          <Select.ItemText>{t.label}</Select.ItemText>
                          <Select.ItemIndicator className="absolute right-2">
                            <Check className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <label htmlFor="kb-title" className="block text-xs font-medium text-foreground-muted">
                Title
              </label>
              <Input
                id="kb-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                disabled={isProcessing}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

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
