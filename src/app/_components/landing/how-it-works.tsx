const STEPS = [
  {
    number: "01",
    title: "Upload your RFP",
    description:
      "Drop in a DOCX or paste text. ProposalPilot extracts the full content server-side — no third-party parsing services.",
  },
  {
    number: "02",
    title: "Requirements extracted",
    description:
      "The AI identifies and structures every must-have and should-have requirement. You review and confirm before generation starts.",
  },
  {
    number: "03",
    title: "Knowledge base matched",
    description:
      "Vector search surfaces your most relevant past proposals, case studies, and SOWs to ground every response in real evidence.",
  },
  {
    number: "04",
    title: "Proposal generated",
    description:
      "Sections stream directly into the rich text editor. Each section shows a confidence score. Regenerate any section in one click.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#060b18] px-6 py-16 scroll-mt-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-white mb-4">
          From RFP to proposal in four steps
        </h2>
        <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">
          The entire workflow lives in one place — no context switching between
          five tools.
        </p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ number, title, description }) => (
            <div key={number}>
              <div className="mb-4 text-4xl font-black text-indigo-600/30 select-none">
                {number}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
