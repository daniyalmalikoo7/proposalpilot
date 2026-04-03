import Link from "next/link";
import { FileText } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-[#060b18] border-t border-slate-800 px-6 py-12">
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          <span className="font-semibold text-white">ProposalPilot</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition">
            How it works
          </a>
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#pricing" className="hover:text-white transition">
            Pricing
          </a>
          <Link
            href={"/sign-in" as any}
            className="hover:text-white transition"
          >
            Sign in
          </Link>
        </nav>

        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} ProposalPilot. MIT License.
        </p>
      </div>
    </footer>
  );
}
