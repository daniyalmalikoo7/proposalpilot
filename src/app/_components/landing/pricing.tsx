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
    <section id="pricing" className="px-6 py-16 scroll-mt-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-white mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-center text-slate-400 mb-16 max-w-xl mx-auto">
          Start for free. Upgrade when you need it.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Free
              </p>
              <p className="text-4xl font-bold text-white">
                $0
                <span className="text-base font-normal text-slate-400">
                  /month
                </span>
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={"/sign-up" as any}
              className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-700"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl border border-indigo-500/50 bg-indigo-950/40 p-8 shadow-lg shadow-indigo-500/10">
            <div className="absolute -top-3 right-6">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-2">
                Pro
              </p>
              <p className="text-4xl font-bold text-white">
                $29
                <span className="text-base font-normal text-slate-400">
                  /month
                </span>
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={"/sign-up" as any}
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
            >
              Start Pro trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
