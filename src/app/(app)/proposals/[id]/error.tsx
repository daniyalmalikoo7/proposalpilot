"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import Link from "next/link";

export default function ProposalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error("Proposal editor error boundary:", error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-background-elevated p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Failed to load proposal
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The proposal could not be loaded. It may have been deleted or you may
          not have access.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/proposals">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to proposals
            </Link>
          </Button>
          <Button onClick={reset} size="sm">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
