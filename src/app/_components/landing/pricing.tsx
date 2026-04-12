import Link from "next/link";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "5 proposals per month",
  "RFP upload + requirement extraction",
  "AI section generation",
  "PDF export",
  "1 knowledge base (up to 50 documents)",
] as const;

const PRO_FEATURES = [
  "Unlimited proposals",
  "Everything in Free",
  "Unlimited knowledge base documents",
  "Confidence scoring",
  "Priority AI generation",
  "DOCX export (coming soon)",
  "Team collaboration (coming soon)",
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="bg-background px-6 py-16 scroll-mt-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold tracking-tight mb-3">
          Simple, transparent pricing
        </h2>
        <p className="text-foreground-muted mb-10 max-w-xl">
          Start for free. Upgrade when you need it.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-xl border border-border bg-background-elevated p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                Free
              </p>
              <p className="text-4xl font-bold">
                $0
                <span className="text-base font-normal text-foreground-muted">
                  /month
                </span>
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={"/sign-up" as any}
              className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              Get started free
            </Link>
          </div>

          {/* Pro — elevated with accent border */}
          <div className="relative rounded-xl border-2 border-[hsl(var(--accent))]/40 bg-accent-muted p-8 shadow-md">
            <div className="absolute -top-3 right-6">
              <span className="rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-xs font-semibold text-[hsl(var(--accent-foreground))]">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent))] mb-2">
                Pro
              </p>
              <p className="text-4xl font-bold">
                $29
                <span className="text-base font-normal text-foreground-muted">
                  /month
                </span>
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={"/sign-up" as any}
              className="block w-full rounded-lg bg-[hsl(var(--accent))] px-4 py-2.5 text-center text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              Start Pro trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
