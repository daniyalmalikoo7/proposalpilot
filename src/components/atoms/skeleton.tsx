import { cn } from "@/lib/utils";

interface SkeletonProps {
  readonly className?: string;
}

/** Shimmer skeleton block for loading states. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}
