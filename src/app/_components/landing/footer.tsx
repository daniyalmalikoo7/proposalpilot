import Link from "next/link";
import { Zap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-background-subtle border-t border-border px-6 py-12">
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[hsl(var(--accent))]" />
          <span className="font-semibold">ProposalPilot</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-foreground-muted">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            How it works
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            Pricing
          </a>
          <Link
            href={"/sign-in" as any}
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            Sign in
          </Link>
        </nav>

        <p className="text-sm text-foreground-dim">
          © {new Date().getFullYear()} ProposalPilot. MIT License.
        </p>
      </div>
    </footer>
  );
}
