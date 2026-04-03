import { ListChecks, BarChart3, Shield, Download } from "lucide-react";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Requirement Tracking",
    description:
      "Every requirement is extracted, tagged, and tracked. See at a glance which requirements each section addresses.",
  },
  {
    icon: BarChart3,
    title: "Confidence Scoring",
    description:
      "Each generated section carries a confidence score based on how well your knowledge base supports the response.",
  },
  {
    icon: Shield,
    title: "KB-Grounded Output",
    description:
      "Responses cite your actual past work. The AI cannot hallucinate experience you do not have — it can only use what you provide.",
  },
  {
    icon: Download,
    title: "Export Ready",
    description:
      "Export to print-ready PDF directly from the browser. DOCX export is on the roadmap for clients who need Word files.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="bg-[#060b18] px-6 py-16 scroll-mt-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-white mb-4">
          Built for the details that win bids
        </h2>
        <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">
          Not another ChatGPT wrapper. ProposalPilot is purpose-built for the
          proposal workflow — from intake to export.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
