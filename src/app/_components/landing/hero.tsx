import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function LandingHero() {
  return (
    <section className="bg-background px-6 pt-32 pb-20">
      <div className="mx-auto max-w-5xl">
        {/* Split-screen: left text, right visual — no centered hero */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: content */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background-subtle px-4 py-1.5 text-sm text-foreground-muted mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
              Powered by AI + your knowledge base
            </span>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
              Stop writing proposals{" "}
              <span className="text-[hsl(var(--accent))]">from scratch</span>
            </h1>

            <p className="mt-6 text-lg text-foreground-muted leading-relaxed">
              ProposalPilot reads your RFP, extracts every requirement, matches
              your past wins from your knowledge base, and generates a tailored,
              brand-consistent proposal — in minutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <SignedOut>
                <Link
                  href={"/sign-up" as any}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </SignedIn>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              >
                See how it works
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: product preview panel */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-border bg-background-elevated p-6 shadow-lg">
              {/* Mock proposal editor preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-danger/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                  </div>
                  <span className="text-xs text-foreground-dim">
                    ProposalPilot — Cloud Migration RFP
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-background-subtle" />
                  <div className="h-3 w-4/5 rounded bg-background-subtle" />
                  <div className="h-3 w-11/12 rounded bg-background-subtle" />
                </div>
                <div className="my-3 flex items-center gap-2">
                  <div className="h-5 w-20 rounded-full bg-success-bg" />
                  <div className="h-5 w-16 rounded-full bg-info-bg" />
                  <span className="ml-auto text-xs text-success-foreground font-medium">
                    84% confidence
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-background-subtle" />
                  <div className="h-3 w-3/4 rounded bg-background-subtle" />
                  <div className="h-3 w-5/6 rounded bg-background-subtle" />
                  <div className="h-3 w-full rounded bg-background-subtle" />
                </div>
                <div className="pt-2 flex justify-end">
                  <div className="h-7 w-24 rounded-lg bg-[hsl(var(--accent))]/20" />
                </div>
              </div>
            </div>
            {/* Floating requirement badge */}
            <div className="absolute -right-4 top-8 rounded-xl border border-border bg-background-elevated p-3 shadow-md">
              <p className="text-xs font-medium text-foreground">12 requirements</p>
              <p className="text-xs text-success-foreground">10 addressed ✓</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
