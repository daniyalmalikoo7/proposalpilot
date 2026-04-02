import Link from "next/link";
import { FileText } from "lucide-react";

export function LandingNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/60 bg-[#060b18]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          <span className="font-semibold text-white">ProposalPilot</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition">
            How it works
          </a>
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#pricing" className="hover:text-white transition">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
