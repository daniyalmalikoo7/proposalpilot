import { RefreshCw, ListChecks, Database } from "lucide-react";

const PROBLEMS = [
  {
    problem: "Proposals take 3–5 days per bid",
    solution: "Generate a first draft in under 10 minutes",
    icon: RefreshCw,
  },
  {
    problem: "Requirements buried in 80-page RFPs",
    solution: "AI surfaces every requirement automatically",
    icon: ListChecks,
  },
  {
    problem: "Generic responses that lose on fit",
    solution: "Answers grounded in your actual past wins",
    icon: Database,
  },
] as const;

export function ProblemSolution() {
  return (
    <section className="bg-background-subtle px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold tracking-tight mb-3">
          The old way is costing you bids
        </h2>
        <p className="text-foreground-muted mb-10 max-w-xl">
          Proposal teams spend most of their time on copy-paste and formatting,
          not on the thinking that actually wins deals.
        </p>

        {/* Single-column list layout — replaces banned 3-column icon grid */}
        <div className="space-y-4">
          {PROBLEMS.map(({ problem, solution, icon: Icon }) => (
            <div
              key={problem}
              className="flex items-start gap-6 rounded-xl border border-border bg-background-elevated p-6 shadow-sm"
            >
              <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-[hsl(var(--accent))]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                <p className="text-sm text-danger line-through">{problem}</p>
                <p className="text-base font-semibold">{solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
