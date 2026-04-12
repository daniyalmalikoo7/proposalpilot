import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent-hover))]",
        secondary:
          "border-transparent bg-background-subtle text-foreground-muted hover:bg-[hsl(var(--border))]",
        destructive:
          "border-transparent bg-danger-bg text-danger-foreground hover:bg-danger/20",
        outline: "text-foreground border-border",
        // Status variants — semantic tokens replace raw blue/purple/cyan
        success:
          "border-transparent bg-success-bg text-success-foreground",
        warning:
          "border-transparent bg-warning-bg text-warning-foreground",
        danger:
          "border-transparent bg-danger-bg text-danger-foreground",
        info:
          "border-transparent bg-info-bg text-info-foreground",
        "info-secondary":
          "border-transparent bg-accent-muted text-[hsl(var(--accent))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
