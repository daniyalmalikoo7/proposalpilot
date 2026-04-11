"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { UploadDropzone } from "@/components/organisms/upload-dropzone";
import { trpc } from "@/lib/trpc/client";

const STEPS = [
  { id: 1, label: "Upload Proposals" },
  { id: 2, label: "Brand Voice" },
  { id: 3, label: "Preview" },
] as const;

const TONE_OPTIONS = ["Formal", "Professional", "Conversational"] as const;
const LENGTH_OPTIONS = ["Concise", "Balanced", "Detailed"] as const;

type ToneOption = (typeof TONE_OPTIONS)[number];
type LengthOption = (typeof LENGTH_OPTIONS)[number];

interface UploadApiResponse {
  ok: boolean;
  data?: { chunks: { text: string }[]; fileName: string };
  error?: { message: string };
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState<ToneOption>("Professional");
  const [length, setLength] = useState<LengthOption>("Balanced");
  const [keywords, setKeywords] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedTexts, setUploadedTexts] = useState<string[]>([]);
  const [kbItemIds, setKbItemIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const kbCreate = trpc.kb.create.useMutation();
  const analyzeBrandVoice = trpc.ai.analyzeBrandVoice.useMutation();
  const createProposal = trpc.proposal.create.useMutation();
  const generateSection = trpc.ai.generateSection.useMutation();

  const handleFilesReady = useCallback((files: File[]) => {
    setPendingFiles((prev) => [...prev, ...files]);
  }, []);

  const handleContinueStep1 = useCallback(async () => {
    if (pendingFiles.length === 0) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const texts: string[] = [];
    const ids: string[] = [];

    try {
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const json = (await res.json()) as UploadApiResponse;

        if (!json.ok || !json.data) {
          throw new Error(
            json.error?.message ?? `Failed to upload ${file.name}`,
          );
        }

        const fullText = json.data.chunks.map((c) => c.text).join("\n\n");
        texts.push(fullText);

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const item = await kbCreate.mutateAsync({
          type: "PAST_PROPOSAL",
          title: baseName,
          content: fullText,
          metadata: { source: "onboarding", originalFileName: file.name },
        });
        ids.push(item.id);
      }

      setUploadedTexts(texts);
      setKbItemIds(ids);
      setStep(2);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [pendingFiles, kbCreate]);

  const handleContinueStep2 = useCallback(async () => {
    // Require at least 100 chars for analyzeBrandVoice schema validation
    const validTexts = uploadedTexts.filter((t) => t.length >= 100).slice(0, 5);

    if (validTexts.length > 0) {
      setIsLoading(true);
      try {
        await analyzeBrandVoice.mutateAsync({ sampleTexts: validTexts });
      } catch {
        // Non-fatal — continue even if brand voice analysis fails
      } finally {
        setIsLoading(false);
      }
    }
    setStep(3);
  }, [uploadedTexts, analyzeBrandVoice]);

  const handleGenerateDemo = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const proposal = await createProposal.mutateAsync({
        title: "Onboarding Demo",
      });

      const result = await generateSection.mutateAsync({
        proposalId: proposal.id,
        sectionTitle: "Executive Summary",
        requirements: [
          "Demonstrate our capability and differentiators",
          "Highlight team expertise and past successes",
        ],
        kbItemIds: kbItemIds.slice(0, 3),
        instructions: `Tone: ${tone}. Length preference: ${length}.${keywords ? ` Keywords: ${keywords}.` : ""}`,
      });

      setGeneratedContent(result.content);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Generation failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [createProposal, generateSection, kbItemIds, tone, length, keywords]);

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-10 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step > s.id
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                    : step === s.id
                      ? "border-2 border-[hsl(var(--accent))] text-[hsl(var(--accent))]"
                      : "border-2 border-border text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  step === s.id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-3 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">
              Upload your past proposals
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ProposalPilot learns your writing style from these. Upload 3–10
              proposals you&apos;re proud of.
            </p>
          </div>
          <UploadDropzone onFilesReady={handleFilesReady} />
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              onClick={() => void handleContinueStep1()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  Continue <ChevronRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Brand voice */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">
              Configure your brand voice
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These settings guide how the AI writes on your behalf.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Tone</p>
              <div className="flex gap-2">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTone(opt)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      tone === opt
                        ? "border-primary bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : "border-border bg-background hover:bg-accent",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Response length</p>
              <div className="flex gap-2">
                {LENGTH_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setLength(opt)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      length === opt
                        ? "border-primary bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : "border-border bg-background hover:bg-accent",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium">
                Brand keywords{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </p>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. innovative, client-centric, proven methodology"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Words or phrases to weave in naturally.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => void handleContinueStep2()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  Continue <ChevronRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Demo */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">See it in action</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s how ProposalPilot will write for you.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Executive Summary — Sample
            </p>
            {!generatedContent && !isLoading && (
              <Button
                variant="outline"
                onClick={() => void handleGenerateDemo()}
                disabled={isLoading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate demo section
              </Button>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--accent))]" />
                Generating with your brand voice…
              </div>
            )}
            {generatedContent && !isLoading && (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {generatedContent}
              </p>
            )}
            {errorMsg && !isLoading && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
