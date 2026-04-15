import Link from "next/link";
import { Zap } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded"
        >
          <Zap className="h-5 w-5 text-[hsl(var(--accent))]" />
          <span className="font-semibold">ProposalPilot</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-foreground-muted sm:flex">
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
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Link
              href={"/sign-in" as any}
              className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              Sign in
            </Link>
            <Link
              href={"/sign-up" as any}
              className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              Get started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
