import { Skeleton } from "@/components/atoms/skeleton";

interface ProposalTableSkeletonProps {
  readonly rows?: number;
}

/** Shape-matched skeleton for the proposals table — mirrors ProposalCard layout. */
export function ProposalTableSkeleton({ rows = 5 }: ProposalTableSkeletonProps) {
  return (
    <div aria-busy="true" aria-label="Loading proposals">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
        >
          {/* Title + client — flex-1 */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          {/* Status badge — w-24 */}
          <Skeleton className="h-5 w-20 rounded-full shrink-0" />
          {/* Deadline — w-20 */}
          <Skeleton className="h-3 w-14 shrink-0" />
          {/* Progress bar — w-28 */}
          <div className="flex w-28 shrink-0 items-center gap-2">
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="h-3 w-8 shrink-0" />
          </div>
          {/* Last edited — w-10 */}
          <Skeleton className="h-3 w-8 shrink-0" />
          {/* Actions — w-7 */}
          <div className="w-7 shrink-0" />
        </div>
      ))}
    </div>
  );
}
