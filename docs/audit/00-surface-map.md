# Surface Map: ProposalPilot

Generated: 2026-04-11

## Framework
- **Framework:** Next.js 15 (App Router, `force-dynamic`)
- **Language:** TypeScript
- **React version:** 18+

## CSS Strategy
- **Tailwind CSS:** v3 (tailwind.config.ts, PostCSS)
- **Dark mode:** Class-based (`darkMode: ["class"]`) — ThemeProvider wraps app
- **CSS custom properties:** Defined in `src/app/globals.css` — both `:root` (light) and `.dark` variants
- **Tailwind animate:** `tailwindcss-animate` plugin installed

## Existing Design Tokens
Two parallel token systems detected — this is a split that needs resolving:

### Shadcn/ui CSS variables (in globals.css)
| Token | Light value | Dark value |
|-------|-------------|------------|
| --background | 0 0% 100% (white) | 222.2 84% 4.9% (near-black) |
| --foreground | 222.2 84% 4.9% | 210 40% 98% |
| --card | 0 0% 100% | 222.2 57% 7% |
| --primary | 222.2 47.4% 11.2% | 210 40% 98% |
| --secondary | 210 40% 96.1% | 217.2 32.6% 14% |
| --muted | 210 40% 96.1% | 217.2 32.6% 14% |
| --accent | 210 40% 96.1% | 217.2 32.6% 14% |
| --destructive | 0 84.2% 60.2% | 0 62.8% 30.6% |
| --border | 214.3 31.8% 91.4% | 217.2 32.6% 18% |
| --radius | 0.5rem | — |

### Custom pp-* tokens (in tailwind.config.ts — dark-first palette)
| Token | Value |
|-------|-------|
| pp-background.DEFAULT | #0a0f1a |
| pp-background.card | #111827 |
| pp-background.elevated | #1a2234 |
| pp-foreground.DEFAULT | #e5e7eb |
| pp-foreground.muted | #9ca3af |
| pp-accent.DEFAULT | #6366f1 (indigo) |
| pp-accent.hover | #818cf8 |
| pp-success | #22c55e |
| pp-warning | #f59e0b |
| pp-danger | #ef4444 |
| pp-border.DEFAULT | #1f2937 |

**Note:** Dual token systems (Shadcn CSS vars + pp-* hardcoded hex) indicate inconsistent token usage — a key uplift target.

## Component Library
- **Radix UI primitives:** Dialog, DropdownMenu, Label, ScrollArea, Separator, Slot, Toast, Tooltip (direct usage)
- **Custom atomic components:** `button.tsx`, `input.tsx`, `badge.tsx`, `progress.tsx`, `skeleton.tsx`, `tooltip.tsx`
- **No Shadcn CLI installation detected** (ui/ directory absent; components hand-rolled)
- **Icons:** Lucide React (installed)
- **Animation:** Framer Motion NOT detected in package.json — only `tailwindcss-animate`
- **Rich text:** TipTap editor (proposals)

## Routes
Total pages: 10 (7 app routes + 2 auth routes + 1 landing)

| # | Route | Auth | Description |
|---|-------|------|-------------|
| 1 | `/` | No | Landing page |
| 2 | `/sign-in` | No | Clerk sign-in |
| 3 | `/sign-up` | No | Clerk sign-up |
| 4 | `/onboarding` | Yes | New user setup wizard |
| 5 | `/dashboard` | Yes | Main dashboard |
| 6 | `/proposals` | Yes | Proposal list |
| 7 | `/proposals/[id]` | Yes | Proposal editor (AI-powered) |
| 8 | `/knowledge-base` | Yes | KB document management |
| 9 | `/settings` | Yes | Account settings |
| 10 | `/settings/brand-voice` | Yes | Brand voice profile |

## Dark Mode
- Class-based via ThemeProvider (`next-themes` pattern)
- App is dark-first (pp-* tokens are dark-palette)
- Light mode CSS vars exist but may not be fully exercised

## Auth
- **Provider:** Clerk (`@clerk/nextjs` v6)
- Sign-in redirects to `/dashboard`
- Sign-up redirects to `/onboarding`
- Middleware (proxy.ts) — routes behind auth gate

## Key observations for agents
1. Dual token system is the primary consistency risk
2. No Framer Motion — motion uplift will require install
3. Custom atomic components (not Shadcn CLI) — can be migrated or upgraded in place
4. Dark-first design (unusual — most apps default light)
5. Complex auth flow: landing → sign-up → onboarding → dashboard
6. Proposal editor is likely the most complex surface (TipTap + AI streaming + sidebar)
