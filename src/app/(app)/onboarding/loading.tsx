import { Skeleton } from "@/components/atoms/skeleton";

export default function OnboardingLoading() {
  return (
    <div
      className="mx-auto max-w-2xl"
      role="status"
      aria-label="Loading onboarding…"
      aria-busy="true"
    >
      {/* Header */}
      <div className="mb-10 space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            {i < 2 && <Skeleton className="h-0.5 w-16" />}
          </div>
        ))}
      </div>

      {/* Wizard card */}
      <div className="rounded-lg border border-pp-border bg-pp-background-card p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full max-w-sm" />
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
