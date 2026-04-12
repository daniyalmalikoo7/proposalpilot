import { cn } from "@/lib/utils";

interface SkeletonProps {
  readonly className?: string;
}

/** Shimmer skeleton block for loading states. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer rounded-md", className)}
    />
  );
}
