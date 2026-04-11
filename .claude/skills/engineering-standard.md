# Engineering Standard

Code quality rules for UI uplift work. Split into machine-enforceable RULES (hooks check these)
and agent-enforceable GUIDELINES (agent mandates enforce these).

## Rules (enforced by quality-gate.sh — exit 2 on violation)

R1: `npx tsc --noEmit` must pass. Zero TypeScript errors.
R2: `npm run lint` must pass (if configured). Zero lint errors.
R3: `npm run build` must pass. The production build must succeed.
R4: Zero `as any` type casts. Use proper types or generics.
R5: Zero empty catch blocks (`catch {}`). All errors must be handled or logged.
R6: No secrets in code (API keys, passwords, tokens). Security hook scans staged files.

## Guidelines (enforced by agent mandates — not machine-checkable)

G1: Files under 300 lines. Extract components/utilities at 250 lines. Exception: generated configs.
G2: No business logic in UI components. Components render props. Logic lives in hooks, services, or server actions.
G3: Every async operation has explicit error handling (try-catch with user-facing error state).
G4: Imports ordered: external → internal → relative → types. Enforced by ESLint import order if configured.
G5: Component files export one primary component. Utility subcomponents may be co-located.
G6: No inline styles unless dynamically computed. Use Tailwind classes or CSS modules.
G7: All Tailwind classes use design tokens, not arbitrary values (no bracket notation like p-[13px]).
G8: Responsive classes ordered: base → sm → md → lg → xl.
G9: Every component that accepts className also uses cn() utility for merging.
G10: Git commits use conventional format: type(scope): description.

## Tailwind-specific rules

TW1: Use semantic token classes (bg-background, text-foreground) not raw color classes (bg-gray-900).
TW2: Use the spacing scale, not arbitrary values. gap-4 not gap-[18px].
TW3: Dark mode via class strategy (.dark) using semantic tokens. No manual dark: prefixes on every class.
TW4: Responsive: mobile-first. Base classes for mobile, breakpoint prefixes for larger.
TW5: Hover/focus/active states explicitly defined. Never rely on browser defaults.

## Component structure

```tsx
// 1. Imports
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// 2. Types
interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

// 3. Component
export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

## Quality bar

Code passes engineering review when:
- All RULES pass (machine-verified by hooks)
- Guidelines are followed in spirit (agent-verified)
- Components follow the structure template
- Tailwind uses tokens exclusively
