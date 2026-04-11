import { cn } from "@/lib/utils";

interface ProgressProps {
  readonly value: number;
  readonly className?: string;
  readonly label?: string;
}

export function Progress({ value, className, label }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clamped}% complete`}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-background-subtle",
        className,
      )}
    >
      <div
        className="h-full bg-[hsl(var(--accent))] transition-all duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
