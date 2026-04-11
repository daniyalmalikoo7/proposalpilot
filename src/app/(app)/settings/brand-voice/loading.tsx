import { Skeleton } from "@/components/atoms/skeleton";

export default function BrandVoiceLoading() {
  return (
    <div
      className="space-y-6 max-w-2xl"
      role="status"
      aria-label="Loading brand voice settings…"
      aria-busy="true"
    >
      {/* Page header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Upload area skeleton */}
      <div className="rounded-lg border-2 border-dashed border-border p-8 flex flex-col items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3.5 w-64" />
        <Skeleton className="h-8 w-32 mt-1" />
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}
