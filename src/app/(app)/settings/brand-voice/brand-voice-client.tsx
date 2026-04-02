"use client";

// Brand voice configuration page.
// Upload up to 5 past proposals (PDF/DOCX) → extract text → ai.analyzeBrandVoice.

import { useCallback, useState } from "react";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  BrandVoiceProfileCard,
  type BrandVoiceProfile,
} from "@/components/molecules/brand-voice-profile-card";
import { cn } from "@/lib/utils";

interface UploadedSample {
  id: string;
  filename: string;
  text: string;
  charCount: number;
}

type AnalysisStatus = "idle" | "analyzing" | "done" | "error";

const MAX_SAMPLES = 5;
const MIN_CHARS = 100;

async function extractTextFromFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
  const json = (await response.json()) as {
    ok: boolean;
    data?: { extractedText: string };
    error?: { message: string };
  };
  if (!json.ok || !json.data)
    throw new Error(json.error?.message ?? "Upload failed");
  return json.data.extractedText;
}

function SampleCard({
  sample,
  onRemove,
}: {
  sample: UploadedSample;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {sample.filename}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {sample.charCount.toLocaleString()} characters
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(sample.id)}
        className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${sample.filename}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BrandVoiceClient() {
  const [samples, setSamples] = useState<UploadedSample[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [profile, setProfile] = useState<BrandVoiceProfile | null>(null);

  const canAddMore = samples.length < MAX_SAMPLES;

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).slice(
        0,
        MAX_SAMPLES - samples.length,
      );
      if (!files.length) return;
      setUploadError(null);
      setUploading(true);
      try {
        const results = await Promise.all(
          files.map(async (file) => {
            const text = await extractTextFromFile(file);
            return {
              id: `${Date.now()}-${Math.random()}`,
              filename: file.name,
              text,
              charCount: text.length,
            } satisfies UploadedSample;
          }),
        );
        setSamples((prev) => [...prev, ...results]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [samples.length],
  );

  const handleAnalyze = useCallback(async () => {
    const validSamples = samples.filter((s) => s.charCount >= MIN_CHARS);
    if (!validSamples.length) return;
    setAnalysisStatus("analyzing");
    try {
      // Production: use tRPC client — trpc.ai.analyzeBrandVoice.mutate(...)
      const response = await fetch("/api/trpc/ai.analyzeBrandVoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            orgId: "demo-org",
            sampleTexts: validSamples.map((s) => s.text),
          },
        }),
      });
      if (!response.ok) throw new Error(`${response.status}`);
      const json = (await response.json()) as {
        result?: { data?: { json?: unknown } };
      };
      const data = json.result?.data?.json as BrandVoiceProfile | undefined;
      if (!data) throw new Error("Unexpected response");
      setProfile(data);
      setAnalysisStatus("done");
    } catch {
      setAnalysisStatus("error");
    }
  }, [samples]);

  const validCount = samples.filter((s) => s.charCount >= MIN_CHARS).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand Voice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload up to {MAX_SAMPLES} past proposals. The AI will extract your
          writing style and use it to generate on-brand content.
        </p>
      </div>

      {/* Drop zone */}
      <label
        htmlFor="sample-upload"
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          canAddMore
            ? "cursor-pointer border-border hover:border-primary/40 hover:bg-accent/30"
            : "cursor-not-allowed border-border opacity-50",
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {canAddMore ? "Click to upload samples" : "Maximum samples reached"}
        </p>
        <p className="text-xs text-muted-foreground">
          PDF or DOCX · {samples.length}/{MAX_SAMPLES} uploaded
        </p>
        <input
          id="sample-upload"
          type="file"
          accept=".pdf,.docx"
          multiple
          disabled={!canAddMore || uploading}
          onChange={(e) => void handleFileChange(e)}
          className="sr-only"
        />
      </label>

      {uploadError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {uploadError}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Extracting text…
        </div>
      )}

      {samples.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Samples
          </p>
          {samples.map((s) => (
            <SampleCard
              key={s.id}
              sample={s}
              onRemove={(id) =>
                setSamples((prev) => prev.filter((x) => x.id !== id))
              }
            />
          ))}
        </div>
      )}

      {samples.length > 0 && analysisStatus !== "done" && (
        <Button
          onClick={() => void handleAnalyze()}
          disabled={validCount === 0 || analysisStatus === "analyzing"}
          className="w-full gap-2"
        >
          {analysisStatus === "analyzing" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Extract Brand Voice ({validCount} sample
              {validCount !== 1 ? "s" : ""})
            </>
          )}
        </Button>
      )}

      {analysisStatus === "error" && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Analysis failed. Please try again.
        </div>
      )}

      {profile && <BrandVoiceProfileCard profile={profile} />}

      {analysisStatus === "done" && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSamples([]);
              setProfile(null);
              setAnalysisStatus("idle");
            }}
          >
            Re-analyze
          </Button>
        </div>
      )}
    </div>
  );
}
