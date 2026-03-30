"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { UploadDropzone } from "@/components/organisms/upload-dropzone";

const STEPS = [
  { id: 1, label: "Upload Proposals" },
  { id: 2, label: "Brand Voice" },
  { id: 3, label: "Preview" },
] as const;

const TONE_OPTIONS = ["Formal", "Professional", "Conversational"] as const;
const LENGTH_OPTIONS = ["Concise", "Balanced", "Detailed"] as const;

type ToneOption = (typeof TONE_OPTIONS)[number];
type LengthOption = (typeof LENGTH_OPTIONS)[number];

const DEMO_TEXT = `Our team has delivered comparable digital transformation initiatives for organisations in the financial services and government sectors. Based on the requirements outlined in your RFP, we propose a phased approach that prioritises risk mitigation while maintaining delivery velocity.

Phase 1 (Weeks 1–4) covers discovery and architecture: stakeholder interviews, systems audit, and a signed-off technical roadmap before any engineering work begins. This ensures complete alignment before we build.`;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState<ToneOption>("Professional");
  const [length, setLength] = useState<LengthOption>("Balanced");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleGenerateDemo = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowDemo(true);
    }, 1800);
  };

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
                    ? "bg-primary text-primary-foreground"
                    : step === s.id
                      ? "border-2 border-primary text-primary"
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
          <UploadDropzone />
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>
              Continue <ChevronRight className="ml-1.5 h-4 w-4" />
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
                        ? "border-primary bg-primary text-primary-foreground"
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
                        ? "border-primary bg-primary text-primary-foreground"
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
            <Button onClick={() => setStep(3)}>
              Continue <ChevronRight className="ml-1.5 h-4 w-4" />
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
            {!showDemo && !isGenerating && (
              <Button variant="outline" onClick={handleGenerateDemo}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate demo section
              </Button>
            )}
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                Generating with your brand voice…
              </div>
            )}
            {showDemo && (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {DEMO_TEXT}
              </p>
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
