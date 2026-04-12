import { ListChecks, BarChart3, Shield, Download } from "lucide-react";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Requirement Tracking",
    description:
      "Every requirement is extracted, tagged, and tracked. See at a glance which requirements each section addresses.",
    size: "lg", // larger card in bento
  },
  {
    icon: BarChart3,
    title: "Confidence Scoring",
    description:
      "Each generated section carries a confidence score based on how well your knowledge base supports the response.",
    size: "sm",
  },
  {
    icon: Shield,
    title: "KB-Grounded Output",
    description:
      "Responses cite your actual past work. The AI cannot hallucinate experience you do not have — it can only use what you provide.",
    size: "sm",
  },
  {
    icon: Download,
    title: "Export Ready",
    description:
      "Export to print-ready PDF directly from the browser. DOCX export is on the roadmap for clients who need Word files.",
    size: "lg",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="bg-background-subtle px-6 py-16 scroll-mt-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold tracking-tight mb-3">
          Built for the details that win bids
        </h2>
        <p className="text-foreground-muted mb-10 max-w-xl">
          Not another ChatGPT wrapper. ProposalPilot is purpose-built for the
          proposal workflow — from intake to export.
        </p>

        {/* Bento grid — varied card sizes replace the banned identical 2×2 grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Large card spanning 2 columns */}
          <div className="sm:col-span-2 flex gap-4 rounded-xl border border-border bg-background-elevated p-6 shadow-sm">
            <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-[hsl(var(--accent))]">
              <ListChecks className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Requirement Tracking</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Every requirement is extracted, tagged, and tracked. See at a
                glance which requirements each section addresses — and which are
                still missing coverage.
              </p>
            </div>
          </div>

          {/* Small card */}
          <div className="flex gap-4 rounded-xl border border-border bg-background-elevated p-6 shadow-sm">
            <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-success-bg text-success-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Confidence Scoring</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Each section shows how well your KB supports the response.
              </p>
            </div>
          </div>

          {/* Small card */}
          <div className="flex gap-4 rounded-xl border border-border bg-background-elevated p-6 shadow-sm">
            <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-warning-bg text-warning-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">KB-Grounded Output</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Only uses evidence you actually have. No hallucinated experience.
              </p>
            </div>
          </div>

          {/* Large card spanning 2 columns */}
          <div className="sm:col-span-2 flex gap-4 rounded-xl border border-border bg-background-elevated p-6 shadow-sm">
            <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-info-bg text-info-foreground">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Export Ready</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Export to print-ready PDF directly from the browser. DOCX export
                is on the roadmap for clients who need Word files. No formatting
                step required — what you see is what ships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
