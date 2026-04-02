import Link from "next/link";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center overflow-hidden">
      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Gemini 2.5 Flash + your knowledge base
        </span>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Stop writing proposals{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            from scratch
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          ProposalPilot reads your RFP, extracts every requirement, matches your
          past wins from your knowledge base, and generates a tailored,
          brand-consistent proposal — in minutes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={"/sign-up" as any}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            See how it works
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
