# Aesthetic Direction: ProposalPilot

Set: 2026-04-11 | Phase 1 — Design System

## Project Profile

| Parameter | Value | Justification |
|-----------|-------|---------------|
| APP_TYPE | **saas-dashboard** | ProposalPilot is a productivity tool users spend significant time in — writing proposals, managing a knowledge base, reviewing requirements. Data-dense, task-focused, professional context. |
| VISUAL_TONE | **warm-refined** | "Professional, intelligent, trustworthy" personality maps to warm-refined: approachable yet polished. Soft shadows, warm neutrals, rounded forms. The antithesis of cold admin-tool energy — this tool helps users win business. It should feel capable without feeling intimidating. |
| MOTION_LEVEL | **standard** | Fade + translate page transitions, hover scale on buttons, skeleton shimmer, spring physics on interactive elements. The app has enough complexity (AI streaming, multi-step flows, dialogs) to justify purposeful motion. Cinematic would distract from work; static would feel dated. |
| DENSITY | **balanced** | Standard 8px grid, line-height 1.5-1.6, padding 16-24px on cards, gap-6 between sections. The proposal editor is complex but users need focus space. Dashboard should surface key info without overwhelming. Not compact — proposals require concentration. |
| BRAND_PERSONALITY | **professional, intelligent, trustworthy** | Light mode default (builds trust, readable for long writing sessions). Dark mode supported as secondary (user toggle). Indigo accent preserved (brand recognition) but used with restraint. |

## Typography

**Framework:** `saas-dashboard × warm-refined` → Inter (geometric sans) with expanded weight range for personality.

| Role | Font | Size | Weight | Line-height |
|------|------|------|--------|-------------|
| Display / hero headings | Inter | 36-48px | 700 | 1.1 |
| Page headings (h1) | Inter | 30px | 600 | 1.2 |
| Section headings (h2) | Inter | 24px | 600 | 1.3 |
| Subsection (h3) | Inter | 20px | 500 | 1.4 |
| Card titles | Inter | 16px | 600 | 1.4 |
| Body default | Inter | 16px | 400 | 1.6 |
| Body small | Inter | 14px | 400 | 1.5 |
| Caption / metadata | Inter | 12px | 400 | 1.4 |
| Button labels | Inter | 14px | 500 | 1 |
| Code / monospace | JetBrains Mono | 13px | 400 | 1.6 |

**Type scale (px):** 12 / 14 / 16 / 20 / 24 / 30 / 36 / 48
**Letter spacing:** -0.02em for headings ≥24px; default for body.
**Max line length:** 72ch (max-w-prose) on editorial content.

## Color Strategy

**warm-refined × saas-dashboard:** Warm white light mode (#faf8f5 base), controlled indigo accent (<12% surface area), warm gray neutrals.

### Light mode (default)
| Semantic role | Value | Notes |
|---------------|-------|-------|
| Background | #faf9f7 | Warm white — not harsh pure white |
| Background elevated (cards) | #ffffff | Clean white cards float above warm base |
| Background subtle | #f4f1ed | Warm off-white for secondary surfaces |
| Foreground | #1a1614 | Near-black with warm undertone |
| Foreground muted | #6b6560 | Warm gray for secondary text |
| Foreground dim | #9c9590 | Warm gray for metadata/captions |
| Border | #e8e2db | Warm light border |
| Border subtle | #f0ece6 | Dividers, section separators |
| Accent (indigo) | #5b5bd6 | Slightly warmer indigo than current #6366f1 |
| Accent hover | #4f4ec4 | Deeper on hover |
| Accent muted | #eeeef9 | Tinted background for accent areas |
| Success | #16a34a | Green |
| Success bg | #f0fdf4 | Light green tint |
| Warning | #d97706 | Amber |
| Warning bg | #fffbeb | Light amber tint |
| Danger | #dc2626 | Red |
| Danger bg | #fef2f2 | Light red tint |
| Info | #2563eb | Blue |
| Info bg | #eff6ff | Light blue tint |

### Dark mode (secondary — user-toggled)
| Semantic role | Value |
|---------------|-------|
| Background | #0f0e0d |
| Background elevated | #1a1816 |
| Background subtle | #242220 |
| Foreground | #f0ece8 |
| Foreground muted | #9c9590 |
| Foreground dim | #6b6560 |
| Border | #2e2b28 |
| Border subtle | #242220 |
| Accent | #818cf8 |
| Accent hover | #a5b4fc |
| Accent muted | #1e1d3f |

## Spacing
8px base grid. Scale: 2 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96

**Component spacing norms (balanced density):**
- Card padding: 20-24px
- Section gap: 32-48px
- Input height: 40px
- Button height: 36px (sm), 40px (default), 44px (lg)
- Sidebar width: 256px
- Modal max-width: 560px

## Border radius
Warm-refined uses rounded, friendly corners:
- Inputs / buttons (small): 8px
- Cards: 12px
- Badges / chips: 6px (rounded-md) or 999px (rounded-full)
- Modals / panels: 16px
- Avatars: 50% (circle)

## Shadows (warm-refined — soft, diffused)
- Level 0 (flat): none
- Level 1 (card): `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Level 2 (dropdown/popover): `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)`
- Level 3 (modal): `0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)`
- Level 4 (sticky header): `0 2px 8px rgba(0,0,0,0.06)`

In dark mode, reduce alpha by 50% — shadows are subtle against dark surfaces.

## Motion (standard level)
- Page transitions: fade + translate-y(8px), 250ms ease-out
- Button hover: scale(1.02), spring-snappy
- Button tap: scale(0.98), spring-snappy
- Modal enter: scale(0.96→1) + opacity, spring-snappy
- Skeleton: shimmer 1.5s linear infinite (already in tailwind.config)
- List stagger: 0.04s between items, opacity + translate-y(6px)
- Tab indicator: shared layout animation (Framer Motion layoutId)
- Sidebar collapse: width transition, spring-gentle

## Anti-slop rules (saas-dashboard)
| Pattern | Decision |
|---------|----------|
| Centered hero | BANNED — landing page must be redesigned to split-screen |
| Gradient buttons | BANNED — solid accent only |
| Three-column icon grid | BANNED — bento or progressive disclosure instead |
| Identical card grid | BANNED for dashboard metrics — use varied hierarchy |
| Emoji as icons | BANNED — Lucide only |
| Shadow on everything | BANNED — elevation hierarchy only (cards get Level 1, modals Level 3) |
| Generic spinner | BANNED for page-level — shape-matched skeletons only |

## Token naming convention
Unified single system (Shadcn CSS var format, warm palette values):
```
--background / --background-elevated / --background-subtle
--foreground / --foreground-muted / --foreground-dim
--border / --border-subtle
--accent / --accent-hover / --accent-muted / --accent-foreground
--success / --success-bg / --success-foreground
--warning / --warning-bg / --warning-foreground
--danger / --danger-bg / --danger-foreground
--info / --info-bg / --info-foreground
--radius-sm / --radius-md / --radius-lg / --radius-xl
--shadow-sm / --shadow-md / --shadow-lg / --shadow-xl
```

The pp-* custom token family is RETIRED. All components migrate to CSS variable tokens.
