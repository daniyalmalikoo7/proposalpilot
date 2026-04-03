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
    <section className="bg-[#060b18] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-white mb-4">
          The old way is costing you bids
        </h2>
        <p className="text-center text-slate-400 mb-16 max-w-xl mx-auto">
          Proposal teams spend most of their time on copy-paste and formatting,
          not on the thinking that actually wins deals.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PROBLEMS.map(({ problem, solution, icon: Icon }) => (
            <div
              key={problem}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-red-400 line-through mb-2">
                {problem}
              </p>
              <p className="text-base font-semibold text-white">{solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
