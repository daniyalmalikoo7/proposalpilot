import { Skeleton } from "@/components/atoms/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading settings…" aria-busy="true">
      {/* Page header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-pp-border pb-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-b-none" />
        ))}
      </div>

      {/* Form section */}
      <div className="rounded-lg border border-pp-border bg-pp-background-card p-6 space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex justify-end pt-1">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
