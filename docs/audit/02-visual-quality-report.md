# Visual Quality Report: ProposalPilot

Generated: 2026-04-11
Auditor: Visual Quality Auditor — Phase 0 Agent 3
Method: Full source-code analysis (auth-gated routes) + screenshot review (public routes)

---

## Executive Summary

Overall quality: **5.5 / 10**
Critical findings: **5**
High findings: **11**
Medium findings: **14**
Low findings: **4**
Routes audited: 10

ProposalPilot has a coherent dark-first colour intent and good structural bones (responsive sidebar, Radix Dialog, Lucide icons). However it suffers from three systemic problems that drag down every surface: (1) a dual token system where Shadcn CSS variables and custom `pp-*` hex tokens coexist without a bridge, so the same semantic concepts resolve to different values depending on which component you are in; (2) a landing page that is textbook AI-slop — centered hero, gradient headline text, indigo blob glow, and three-column icon grid — that uses completely different raw Tailwind/Slate color classes rather than any design token; (3) zero animated motion beyond `transition-colors` and `transition-opacity`, meaning the app has no page-transition feel, no skeleton shimmer variety, no modal spring, and no interaction micro-feedback beyond color change on hover.

The app is usable but reads as a prototype. It is not at the quality bar required to win enterprise proposals customers.

---

## Baseline Metrics

| Route | Lighthouse (code-estimated) | axe-core risk | Quality score |
|-------|-----------------------------|---------------|---------------|
| `/` (landing) | ~65 (CLS risk, glow div, no font preload) | Medium — missing skip-link, color-only link states | 4/10 |
| `/sign-in` | ~75 (Clerk-hosted, no control) | Low (Clerk handles) | 6/10 |
| `/sign-up` | ~75 | Low | 6/10 |
| `/onboarding` | ~70 | Medium — button touch targets, mixed token usage | 5.5/10 |
| `/dashboard` | ~72 | Medium — loading state is spinner not skeleton; filter tab buttons no ARIA | 6/10 |
| `/proposals` | ~75 | Low-medium | 6.5/10 |
| `/proposals/[id]` (editor) | ~65 (3-panel full-screen, no transitions) | Medium — no focus trap on panels, missing aria-live for save state | 5/10 |
| `/knowledge-base` | ~73 | Medium — filter tabs no aria-selected | 6/10 |
| `/settings` | ~74 | Low | 6.5/10 |
| `/settings/brand-voice` | ~72 | Low-medium | 6/10 |

Note: Lighthouse scores estimated from code analysis. Lighthouse and axe-core were not run instrumentally in this phase.

---

## Principle 1: Nothing is Outdated

### P1 Findings

| Severity | Finding | File | Evidence | Correct value |
|----------|---------|------|----------|---------------|
| HIGH | Centered hero with gradient H1 text — canonical AI-slop layout | `src/app/_components/landing/hero.tsx` L6, L22–25 | `text-center`, `bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent` on H1 | Split-screen or left-aligned content with right asset; solid accent text, no gradient |
| HIGH | Three-column icon-grid on features section — second most generic LLM pattern | `src/app/_components/landing/features.tsx` L42 | `grid grid-cols-1 gap-6 sm:grid-cols-2` with 4 identical `flex gap-4` icon+text cards | Bento grid with varied sizes, or single-column with progressive disclosure |
| HIGH | Three-column icon-grid on problem-solution — same pattern repeated | `src/app/_components/landing/problem-solution.tsx` L33 | `grid grid-cols-1 gap-6 sm:grid-cols-3` with 3 identical cards | Same as above |
| HIGH | Landing page uses raw Tailwind Slate/Indigo classes (slate-400, slate-800, indigo-600) — no design token usage | `src/app/_components/landing/hero.tsx`, `nav.tsx`, `pricing.tsx`, `features.tsx`, `problem-solution.tsx`, `how-it-works.tsx`, `footer.tsx` | Over 40 instances of `text-slate-400`, `bg-slate-800`, `bg-indigo-600`, `border-slate-800` | Should use `text-foreground/60`, `bg-background`, `bg-pp-accent`, `border-pp-border` |
| MEDIUM | Indigo radial glow blob — decorative background, dated "SaaS startup" aesthetic | `src/app/_components/landing/hero.tsx` L9–13 | `h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]` — fixed-size arbitrary values | Remove or replace with subtle geometric pattern; h/w values are off-grid arbitrary |
| MEDIUM | Raw hardcoded background color `#060b18` repeated 7 times across landing components instead of token | `src/app/page.tsx` L11, `hero.tsx` L6, `nav.tsx` L6, `pricing.tsx` L24, `features.tsx` L32, `footer.tsx` L6, `how-it-works.tsx` L30 | `bg-[#060b18]` used in every landing section | Should be `bg-pp-background` (which is `#0a0f1a` — close but not same; `#060b18` is a unique value not in token system) |
| MEDIUM | App-shell top-bar at 44px height (h-11) — slightly below L6 recommendation of ≤64px but works; sidebar logo bar also h-11 — mismatches the 64px guideline | `src/components/templates/app-shell.tsx` L21 | `h-11` = 44px | Consider h-14 (56px) for standard app header height; editor top-bar is already h-14 |
| LOW | Pricing cards use `rounded-xl` while landing feature cards also use `rounded-xl` and proposal editor cards use `rounded-lg` — three-level inconsistency (xl for landing, lg for app) | `src/app/_components/landing/pricing.tsx` L35, L67; `src/app/_components/landing/features.tsx` L46 vs `src/app/(app)/dashboard/page.tsx` L162 | Landing: `rounded-xl`; App: `rounded-lg` | Establish a single card radius token: 12px (rounded-xl) for all cards |

### P1 Summary
The app portion is better than the landing page. App components use consistent `rounded-lg` on cards, Lucide icons only, and no Bootstrap artifacts. The landing page is the primary offender — it reads as a default LLM output and needs full redesign against anti-slop rules.

---

## Principle 2: Motion is Communication

### P2 Findings

| Severity | Finding | File | Evidence | Correct value |
|----------|---------|------|----------|---------------|
| CRITICAL | No page-transition animations exist. Navigation between routes produces instant content swap with zero visual feedback | App-wide — no transition wrapper found | No `AnimatePresence`, no page-level motion wrapper, no CSS transition on route content | Add Framer Motion `AnimatePresence` with `opacity 0→1, y 8→0, 250ms ease-out` on all route content |
| CRITICAL | No Framer Motion installed — the entire motion system depends on CSS `transition-colors`/`transition-opacity` only | `package.json` (confirmed by surface map) | Surface map: "Framer Motion NOT detected in package.json — only tailwindcss-animate" | `npm install framer-motion` — required for spring animations, layout animations, `AnimatePresence` |
| HIGH | Dashboard loading state is a centered spinner + text, not a skeleton matching the content layout | `src/app/(app)/dashboard/page.tsx` L232–236 | `<Loader2 className="h-4 w-4 animate-spin" />` + "Loading proposals…" text inside the proposals table area | Replace with skeleton rows matching ProposalCard layout (icon + title line + badge + date) |
| HIGH | Proposal editor loading state is a full-screen centered spinner — zero context about what is loading | `src/app/(app)/proposals/[id]/page.tsx` L51–56 | `<Loader2 className="h-6 w-6 animate-spin text-pp-foreground-muted" />` centered in h-screen | Replace with skeleton matching the 3-panel layout: sidebar skeleton + center content skeleton |
| HIGH | Brand voice analysis state uses spinner + text inline — no progress indication for what can be a multi-second AI operation | `src/app/(app)/settings/brand-voice/brand-voice-client.tsx` | `Loader2` + "Extracting text…" — no progress bar, no estimated time, no stage names | Add progress stages: "Uploading → Extracting → Analyzing style → Building profile" with step indicator |
| MEDIUM | `transition-colors` used everywhere without duration specification — defaults to browser default (typically 150ms but uncontrolled) | `src/app/(app)/dashboard/page.tsx` L199, `src/app/(app)/proposals/page.tsx` L83, sidebar.tsx L71 etc. | `transition-colors` with no `duration-*` class | Add explicit `duration-150` to all interactive element transitions |
| MEDIUM | Shimmer animation uses `linear` easing (tailwind.config.ts keyframes) — not GPU-optimal, and the gradient direction is incorrect (should be 90deg not unspecified) | `tailwind.config.ts` L88–95; `src/components/atoms/skeleton.tsx` L12 | Animation is `shimmer 1.5s linear infinite`; `from-muted via-muted-foreground/10 to-muted` gradient | Use standard shimmer: `linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.06) 50%, transparent 75%)` with `background-size: 200% 100%` |
| MEDIUM | Tab switching on Settings page has no visual indicator animation — the `border-b-2` active indicator appears/disappears instantly | `src/app/(app)/settings/page.tsx` L70–79 | `border-b-2 border-primary` toggled by className, no shared layout animation | Use Framer Motion `layoutId` on a tab indicator element for smooth position slide |
| MEDIUM | Save state in editor top-bar transitions between "Saving…" → "Saved" as instant text swap — should animate state changes | `src/app/(app)/proposals/[id]/page.tsx` L96–107 | Conditional render of spans with no AnimatePresence | Wrap in AnimatePresence with opacity fade; "Saved" green text should fade in then auto-fade out |
| LOW | Button `whileHover` / `whileTap` micro-feedback absent — buttons only change color, no scale transform | `src/components/atoms/button.tsx` | Only `transition-colors hover:bg-primary/90` — no transform feedback | Add Framer Motion to Button: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}` |

### P2 Summary
Motion is nearly absent. The entire animation budget is `transition-colors` on hover states and one CSS shimmer keyframe. Framer Motion must be installed. The minimum viable motion uplift is: page transitions, skeleton-based loading states, AnimatePresence on conditional content, and button feedback.

---

## Principle 3: Perfection in the Details

### P3 Findings

| Severity | Finding | File | Evidence | Correct value |
|----------|---------|------|----------|---------------|
| CRITICAL | Inconsistent card padding within same component type: dashboard stat cards use `px-4 py-4` (16px), proposal table card uses no padding on container (children have `px-4 py-3`), settings billing cards use `p-5` (20px), KB upload form uses `p-5`, brand voice client uses `p-3` — 4 different values for "card internal padding" | `dashboard/page.tsx` L162, `settings/page.tsx` L151, L198, `brand-voice-client.tsx` L60 | `px-4 py-4`, `p-5`, `p-3`, `p-6` on cards of the same semantic level | Standardize: outer cards `p-5` (20px), inner/compact cards `p-4` (16px) |
| HIGH | 8 unique arbitrary text size values outside the Tailwind scale: `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]` — none map to a defined type scale | `sidebar.tsx` L99 (`text-[11px]`), `kb-search-panel.tsx` L121 (`text-[11px]`), L148 (`text-[10px]`), `requirements-sidebar.tsx` L88 (`text-[13px]`), L126 (`text-[13px]`), L139 (`text-[11px]`), L145 (`text-[10px]`), `proposal-editor/index.tsx` L147 (`text-[15px]`), `dashboard/page.tsx` L208 (`text-[10px]`), `knowledge-base/page.tsx` L173 (`text-[10px]`) | 10 occurrences of 5 unique arbitrary font sizes | Define type scale in tailwind.config.ts: `xs: 12px`, `sm: 14px`, `base: 16px`; add `2xs: 11px` token if needed; eliminate all arbitrary bracket sizes |
| HIGH | Header font size inconsistency across app routes: `/proposals` uses `text-2xl` (24px), `/dashboard` uses `text-xl` (20px), `/knowledge-base` uses `text-xl` (20px), `/settings` uses `text-xl` (20px), `/onboarding` uses `text-2xl` (24px) — two different page H1 sizes | `proposals/page.tsx` L31, `dashboard/page.tsx` L111, `knowledge-base/page.tsx` L121, `settings/page.tsx` L59, `onboarding/page.tsx` L7 | `text-2xl` on proposals and onboarding; `text-xl` on dashboard, KB, settings | Standardize all app page H1 to `text-xl` (20px) or `text-2xl` (24px) — pick one |
| HIGH | Landing page font sizes define a separate scale (text-sm, text-lg, text-3xl, text-4xl, text-5xl, text-6xl, text-7xl) never used in the app — two entirely separate type scales exist | `hero.tsx` L21 (`text-5xl sm:text-6xl lg:text-7xl`), `pricing.tsx` L40 (`text-4xl`), `features.tsx` L34 (`text-3xl`), `how-it-works.tsx` L43 (`text-4xl`) | 7 unique font sizes across landing vs 5+ in app — no shared scale | Define a unified type scale in tailwind.config.ts covering both contexts |
| MEDIUM | Multiple `space-y-*` values used inconsistently as section spacing: `space-y-5` on dashboard, `space-y-6` on proposals, `space-y-5` on KB, `space-y-6` on settings, `space-y-4` on settings tabs | `dashboard/page.tsx` L107 (`space-y-5`), `proposals/page.tsx` L28 (`space-y-6`), `knowledge-base/page.tsx` L117 (`space-y-5`), `settings/page.tsx` L56 (`space-y-6`) | Inconsistent by 1 Tailwind step between same-level routes | Standardize page-level `space-y-6` across all app routes |
| MEDIUM | Filter tabs in dashboard and KB use `py-1.5 px-2.5` (12px/10px) — tight touch targets at ~28px height on mobile | `dashboard/page.tsx` L199, `knowledge-base/page.tsx` L163 | `py-1.5 px-2.5` = ~28px height | Minimum `py-2` for filter tabs; recommend `py-2 px-3` for 40px touch-friendly targets |
| MEDIUM | `h-[600px] w-[600px]` arbitrary values on landing glow div — off-grid | `src/app/_components/landing/hero.tsx` L12 | `h-[600px] w-[600px]` not on 8px grid (600 is divisible by 8 technically but never a spacing token) | Replace with decorative SVG or `size-[384px]` / CSS custom property |
| MEDIUM | Sidebar version text uses arbitrary `text-[11px]` size | `src/components/organisms/sidebar.tsx` L99 | `text-[11px]` | Use `text-xs` (12px) — the difference is 1px and unnoticeable |
| LOW | ProposalCard `w-7 shrink-0` for actions column — arbitrary 28px width | `src/components/molecules/proposal-card.tsx` L103 | `w-7` for the MoreHorizontal column | Use `w-8` to align with icon button h/w-7 or move to actual Icon size |
| LOW | Stats grid uses `gap-3` (12px) while the proposal table card uses implicit gap via padding — sub-grid consistency issue | `dashboard/page.tsx` L125 | `grid grid-cols-2 gap-3 md:grid-cols-4` | Use `gap-4` (16px) to match the 8px grid evenly |

### P3 Summary
10 arbitrary font-size values, 4 different card padding values, and inconsistent H1 sizes across routes are the critical spacing/type issues. The type scale must be defined in tailwind.config.ts and all bracket-notation sizes eliminated.

---

## Principle 4: Zero Clutter

### P4 Findings

| Severity | Finding | File | Evidence | Correct value |
|----------|---------|------|----------|---------------|
| HIGH | Proposal editor top-bar has 6 action controls simultaneously visible on a narrow bar: ← breadcrumb, title, save state (conditional), KB toggle, DOCX export, PDF export — the two export buttons are identical except for label | `src/app/(app)/proposals/[id]/page.tsx` L72–153 | `← Proposals / [title] | save state | KB | DOCX | PDF` on one 56px bar | Combine DOCX + PDF into a single "Export" dropdown; this reduces to 4 items |
| MEDIUM | Dashboard stats grid shows 4 metric cards before any proposals exist (empty state) — context-free numbers ("No data yet" × 3) add visual noise without value | `src/app/(app)/dashboard/page.tsx` L124–182 | All 4 stat cards render on load including when showing "No data yet" string | Hide stats cards or show a compact onboarding prompt when no proposals exist |
| MEDIUM | Landing page sections all share identical `bg-[#060b18]` — no visual breathing room or section differentiation over a ~4000px scroll height | All landing sections | Zero background variation across 6 sections | Use subtle alternating backgrounds: `bg-[#060b18]` / `bg-[#080e1c]` (slight variance) or horizontal rules |
| LOW | Filter tabs on dashboard show 7 options (All, Draft, In Progress, Review, Sent, Won, Lost) with count badges — on a 375px mobile viewport these wrap to 2 rows, causing layout shift | `dashboard/page.tsx` L14–25, L187 | 7 tab items in `flex flex-wrap` | Consider showing only non-zero count tabs on mobile, or using a select/dropdown below 640px |

### P4 Summary
The app is not deeply cluttered. The primary P4 issue is the editor top-bar density (6 items) and the stats-when-empty noise. The landing page monotony (7 sections, same background) is a low-severity clutter-by-repetition issue.

---

## Principle 5: System Consistency

### P5 Findings

| Severity | Finding | File | Evidence | Correct value |
|----------|---------|------|----------|---------------|
| CRITICAL | Two parallel token systems in active use — Shadcn CSS vars (`bg-card`, `bg-background`, `text-muted-foreground`, `border-border`) and custom pp-* hex tokens (`bg-pp-background-card`, `bg-pp-background`, `text-pp-foreground-muted`, `border-pp-border`) — same semantic concept resolves to different values depending on the component | `brand-voice-profile-card.tsx` L30 (`bg-card`), `kb-upload-form.tsx` L70 (`bg-card`), `new-proposal-dialog.tsx` L89 (`bg-card`, `border-border`) vs `dashboard/page.tsx` L162 (`bg-pp-background-card`, `border-pp-border`) | `bg-card` = `hsl(222.2 57% 7%)` vs `bg-pp-background-card` = `#111827` — close but not identical; `border-border` = `hsl(217.2 32.6% 18%)` vs `border-pp-border` = `#1f2937` — different values | Consolidate: make `--card` = `#111827`, `--border` = `#1f2937`, etc., so pp-* tokens ARE the CSS vars |
| CRITICAL | `blue-950/blue-400` and `purple-950/purple-400` used as raw Tailwind colors for IN_PROGRESS and REVIEW status badges — these are not in the design token system | `src/components/molecules/proposal-card.tsx` L13–14 (with comment "no pp-* blue token"), `src/components/molecules/kb-item-card.tsx` L12–13, L15 (METHODOLOGY: purple-950, CAPABILITY: cyan-950) | `bg-blue-950 text-blue-400`, `bg-purple-950 text-purple-400`, `bg-cyan-950 text-cyan-400` | Add `pp-info`, `pp-purple`, `pp-cyan` semantic status tokens to tailwind.config.ts |
| HIGH | The landing page uses Tailwind color classes (slate-*, indigo-*) that are entirely disconnected from the app's design token system | 40+ instances across all landing components | Landing uses: `text-slate-400`, `text-slate-300`, `text-slate-500`, `bg-slate-800`, `bg-slate-900/60`, `border-slate-800`, `text-indigo-300`, `text-indigo-400`, `bg-indigo-600`, `bg-indigo-950/40` — none mapped to pp-* tokens | Map landing colors to pp-* tokens or extend the token system to cover the marketing surface |
| HIGH | `onboarding/page.tsx` uses `text-muted-foreground` (Shadcn token) for subtitle while all other app subtitles use `text-pp-foreground-muted` (pp-* token) | `src/app/(app)/onboarding/page.tsx` L15 | `text-muted-foreground` vs `text-pp-foreground-muted` used elsewhere | Replace with `text-pp-foreground-muted` |
| HIGH | `error.tsx` pages (app-level and proposal editor) use `bg-card`, `border-border` (Shadcn tokens) while surrounding AppShell uses pp-* tokens | `src/app/(app)/error.tsx` L21, `src/app/(app)/proposals/[id]/error.tsx` L21 | `rounded-lg border border-border bg-card` in error state containers | Use `bg-pp-background-card border-pp-border` |
| MEDIUM | Settings tabs use `border-b-2 border-primary` for active state — `border-primary` resolves to `hsl(var(--primary))` which in dark mode is `hsl(210 40% 98%)` (near white) — not the indigo accent color the rest of the app uses | `src/app/(app)/settings/page.tsx` L74 | `border-b-2 border-primary` on active tab | Use `border-pp-accent` to match the accent color used in sidebar active state |
| MEDIUM | Dashboard filter tabs use `bg-primary text-primary-foreground` for active state — same issue as settings tabs, `bg-primary` in dark mode = near-white background with near-black text — inverted and inconsistent with sidebar's `bg-pp-accent/10 text-pp-accent` active state | `src/app/(app)/dashboard/page.tsx` L201, `knowledge-base/page.tsx` L164 | `bg-primary text-primary-foreground` for active filter tab vs `bg-pp-accent/10 text-pp-accent` in sidebar | Standardize active tab state to `bg-pp-accent text-white` or `bg-pp-accent/15 text-pp-accent` |
| MEDIUM | Modal dialog (`NewProposalDialog`) uses `rounded-xl border-border bg-card` while app cards use `rounded-lg border-pp-border bg-pp-background-card` — different radius and tokens in the same semantic layer | `src/components/organisms/new-proposal-dialog.tsx` L89 | `rounded-xl` on modal vs `rounded-lg` on cards | `rounded-xl` for modals is defensible (elevated surface), but `border-border bg-card` should be `border-pp-border bg-pp-background-card` |
| LOW | `brand-voice-profile-card.tsx` L92 uses `bg-primary` for a dot accent — `bg-primary` in dark mode is near-white, which is semantically wrong for an accent dot | `src/components/molecules/brand-voice-profile-card.tsx` L92 | `bg-primary` | `bg-pp-accent` |

### P5 Summary
The dual token system is the single largest systemic issue in the codebase. It means every new component has a 50/50 chance of being styled with the wrong token family, creating invisible drift. Five unique off-token color groups exist in production code: `blue-950/400`, `purple-950/400`, `cyan-950/400` for status badges, plus the full `slate-*/indigo-*` palette on the landing page.

---

## Principle 6: Performance as UX

### P6 Findings (code-analysis only — Lighthouse not run)

| Severity | Finding | File | Evidence | Risk |
|----------|---------|------|----------|------|
| HIGH | CLS risk: dashboard stats grid renders 4 empty skeleton-free cards during loading before `isLoading` resolves, then re-renders with real values — dimensions shift from "—" to numbers | `src/app/(app)/dashboard/page.tsx` L128–181 | `value: isLoading ? "—" : String(stats.active)` — the `text-2xl font-mono` vs `text-sm text-pp-foreground-muted` for "No data yet" have different heights | Use consistent height skeleton placeholder during loading; pre-reserve the stat number height |
| HIGH | Landing page radial glow is a 600×600px absolutely positioned div with `blur-[120px]` — this triggers a CSS filter composite layer on every browser repaint and likely contributes to a Lighthouse performance penalty | `src/app/_components/landing/hero.tsx` L12 | `h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]` | Replace with a static SVG radial gradient (`<radialGradient>`) which is GPU-composited and paint-free |
| MEDIUM | No `font-display: swap` or explicit font preload found in the project. Default Next.js may handle this via `next/font` but no `next/font` usage detected — landing page text may be invisible during font load | No `next/font` import found across scanned files | Landing uses system `text-white` which doesn't load a web font, but app `font-sans` likely defaults to Inter via the Shadcn CSS setup without explicit declaration | Verify `next/font` is configured for Inter; add `display: 'swap'` |
| MEDIUM | Images: no `<Image>` from `next/image` found in any scanned component. The landing page has no hero images (only icon SVGs and a glow div), so no CLS from images currently. However, brand-voice analysis results may include images in future | No `<img>` or `<Image>` found in scanned files | No CLS risk from images today | Pre-emptive: establish `<Image>` usage rule before adding product screenshots |
| LOW | KB filter tabs use `flex-wrap` which can cause layout reflow on mobile when item counts change and text changes width | `src/app/(app)/knowledge-base/page.tsx` L154 | `flex flex-wrap gap-1.5` with mono count badges that change value | Use `grid` with fixed column count or pre-size count badges with `min-w-[24px]` |

### P6 Summary
No catastrophic performance issues from code analysis alone. The main concerns are the CLS from dashboard stats, the CSS filter glow element, and absence of confirmed `next/font` setup. Lighthouse validation in Phase 3 will establish actual scores.

---

## Principle 7: Accessibility

### P7 Findings

| Severity | Finding | File | Evidence | Correct value |
|----------|---------|------|----------|---------------|
| CRITICAL | No skip-to-content link exists on any page | App-wide | No `<a href="#main-content">Skip to content</a>` in layout or any page wrapper | Add to root layout: `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>` |
| CRITICAL | Filter tab `<button>` elements in Dashboard and Knowledge Base have no `aria-selected` or `role="tab"` — they are interactive buttons mimicking tab behavior without ARIA roles | `src/app/(app)/dashboard/page.tsx` L195–218, `knowledge-base/page.tsx` L158–183 | `<button onClick={handleFilterChange}>` with no ARIA attributes | Add `role="tab"`, `aria-selected={isActive}`, wrap in `role="tablist"` container |
| CRITICAL | Inline `<button>` in `KBItemCard` title toggle has no accessible label | `src/components/molecules/kb-item-card.tsx` L71–79 | `<button type="button" onClick={() => setExpanded((v) => !v)} className="text-left">` — no aria-label, aria-expanded, or descriptive text for assistive technology | Add `aria-expanded={expanded}` and `aria-label={\`${item.title} — click to ${expanded ? 'collapse' : 'expand'} details\`}` |
| HIGH | Dashboard error state renders a plain `<p>` with `text-destructive` — no `role="alert"` or `aria-live` region | `src/app/(app)/dashboard/page.tsx` L240–243 | `<p className="px-4 py-8 text-center text-sm text-destructive">` | Add `role="alert"` to error state containers |
| HIGH | Editor save state ("Saving…" / "Saved") is visually announced but has no `aria-live` region — screen readers do not announce auto-dismissed state changes | `src/app/(app)/proposals/[id]/page.tsx` L96–107 | Conditional `<span>` rendering without `aria-live="polite"` | Wrap save state indicator in `aria-live="polite"` container |
| HIGH | `h-7 w-7` (28px × 28px) icon buttons used in multiple locations — 5 instances below 44×44px touch target minimum on mobile | `kb-item-card.tsx` L96 (`h-6 w-6`!), `new-proposal-dialog.tsx` L101 (`h-7 w-7`), `proposal-card.tsx` L107 (`h-7 w-7`), `proposal-editor/index.tsx` L226, L235 (`h-7`) | All `h-7` = 28px — 36% below the 44px minimum | Increase to minimum `h-9 w-9` (36px) for these icon buttons; add `min-h-[44px]` padding via `p-2` on the button |
| HIGH | `KBItemCard` action menu items (`<button>` in dropdown) have no accessible min-height and no keyboard navigation within the dropdown | `src/components/molecules/kb-item-card.tsx` L107–131 | `py-1.5` dropdown items, no `aria-haspopup`, no `aria-expanded`, no keyboard trap | Use Radix DropdownMenu for this menu — it provides keyboard navigation, ARIA roles, and focus management out of the box |
| HIGH | Landing nav links have no `aria-current="page"` and the "Sign in" / "Get started" links have no differentiating ARIA attributes | `src/app/_components/landing/nav.tsx` | No ARIA on nav links | Add `aria-current="page"` where applicable |
| MEDIUM | `<aside>` elements (sidebar, requirements sidebar, KB search panel) have no `aria-label` to distinguish them for screen reader users — two `<aside>` elements exist on the editor page simultaneously | `requirements-sidebar.tsx` L54, L78, L99; `kb-search-panel.tsx` L68 | `<aside className="flex h-full...">` with no label | Add `aria-label="Requirements"` and `aria-label="Knowledge base"` |
| MEDIUM | Color is the sole differentiator for error state text — `text-destructive` on error messages with no error icon | `src/app/(app)/settings/page.tsx` L98–100, `dashboard/page.tsx` L240–243, `proposals/[id]/page.tsx` L60–65 | `<p className="text-sm text-destructive">` with no icon | Add `<AlertCircle className="h-4 w-4" />` before error text |
| MEDIUM | Brand-voice dropzone uses `border-dashed` with no explicit `role="region"` or aria instructions for screen readers | `src/app/(app)/settings/brand-voice/brand-voice-client.tsx` L168 | Dashed border drop area is a visual affordance only | Add `role="button"` or use a proper `<button>` with `aria-label="Upload samples"` |
| MEDIUM | Proposal card row is a `<div onClick>` not a `<button>` or `<a>` — keyboard users cannot tab to or activate it | `src/components/molecules/proposal-card.tsx` L51 | `<div className="group flex cursor-pointer..." onClick={...}>` | Change to `<button type="button">` or `<a href={...}>` for keyboard accessibility |
| LOW | Settings tab bar has no `role="tablist"` wrapping element | `src/app/(app)/settings/page.tsx` L66–80 | `<div className="flex border-b border-pp-border">` with `<button>` children | Add `role="tablist"` to the div and `role="tab"` + `aria-selected` to buttons |

### P7 Summary
Three CRITICAL accessibility findings: no skip-link, filter tabs without ARIA tab roles, and unexplabeled expand-toggle buttons. Three HIGH findings involving missing `aria-live` on dynamic state, sub-44px touch targets (h-7/h-6 buttons), and unmanaged custom dropdown menus. The proposal card clickable div is a keyboard-inaccessible element on one of the most-used surfaces.

---

## De Facto Token Analysis

### Colors in use (unique values found across source)

**pp-* system (correct):**
- `#0a0f1a` — pp-background.DEFAULT
- `#111827` — pp-background.card
- `#1a2234` — pp-background.elevated
- `#e5e7eb` — pp-foreground.DEFAULT
- `#9ca3af` — pp-foreground.muted
- `#6b7280` — pp-foreground.dim
- `#6366f1` — pp-accent.DEFAULT
- `#818cf8` — pp-accent.hover
- `#22c55e` — pp-success.DEFAULT
- `#052e16` — pp-success.bg
- `#4ade80` — pp-success.text
- `#f59e0b` — pp-warning.DEFAULT
- `#451a03` — pp-warning.bg
- `#fbbf24` — pp-warning.text
- `#ef4444` — pp-danger.DEFAULT
- `#450a0a` — pp-danger.bg
- `#f87171` — pp-danger.text
- `#1f2937` — pp-border.DEFAULT
- `#374151` — pp-border.hover

**Shadcn CSS vars (parallel system — creates drift):**
- `hsl(0 0% 100%)` — background (light)
- `hsl(222.2 84% 4.9%)` — background (dark) ≈ `#060d2b`
- `hsl(222.2 57% 7%)` — card (dark) ≈ `#0e1529` (close to `#111827` but NOT equal)
- `hsl(217.2 32.6% 14%)` — secondary/muted/accent (dark) ≈ `#171e2e`
- `hsl(217.2 32.6% 18%)` — border/input (dark) ≈ `#1c2538` (different from `#1f2937`)
- `hsl(210 40% 98%)` — primary-foreground (dark) = near white

**Off-token raw values (no token mapping):**
- `#060b18` — landing background (used 7× — NOT equal to `#0a0f1a` pp-background)
- `blue-950` / `blue-400` — status badges (2 components)
- `purple-950` / `purple-400` — status badges (2 components)
- `cyan-950` / `cyan-400` — KB item card
- `red-400` — problem-solution strikethrough text (1 instance)
- `slate-300`, `slate-400`, `slate-500`, `slate-800`, `slate-900` — landing page (40+ instances)
- `indigo-300`, `indigo-400`, `indigo-500`, `indigo-600` — landing page (25+ instances)
- `violet-400` — hero gradient (1 instance)

**Total unique colors not in token system: 14+ (CRITICAL by P5 threshold of >5)**

### Spacing values

On-grid (correct): `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px), `gap-2`, `gap-3`, `gap-4`, `gap-6`

Off-grid or arbitrary:
- `gap-0.5` (2px) — used in sidebar nav items, filter tabs (borderline; represents 2px micro-gap, acceptable but unusual)
- `gap-1.5` (6px) — used in 8 locations for icon+text pairs (not on 8px grid)
- `px-2.5` (10px) — used in filter tabs (not on 8px grid — should be `px-3`)
- `py-0.5` (2px) — badge padding (acceptable minimum but means badge height = text + 4px)
- `py-1.5` (6px) — used in 6 locations (halfway between 4px and 8px — consistent but off-grid)
- `py-2.5` (10px) — settings tabs (not on 8px grid)

**Count of unique off-grid spacing values: 6 — exceeds HIGH threshold (>3)**

### Font sizes

Defined Tailwind scale values in use: `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px), `text-3xl` (30px), `text-4xl` (36px), `text-5xl` (48px), `text-6xl` (60px), `text-7xl` (72px)

Arbitrary values (off-scale): `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]`

**Total unique font sizes: 15 (11 on scale + 4 arbitrary) — significantly exceeds the ≤4 scale threshold**

### Border radii

| Value | Pixels | Used on |
|-------|--------|---------|
| `rounded-full` | 9999px | Badges, progress bar, avatar-like containers, step circles |
| `rounded-xl` | 12px (default) | Landing cards, landing dropzone, modal dialog |
| `rounded-lg` | 8px (--radius) | App cards, buttons (sm/lg), skeleton, upload forms |
| `rounded-md` | 6px (calc(--radius - 2px)) | Inputs, dropdowns, nav items, editor toolbar buttons |
| `rounded-sm` | 4px (calc(--radius - 4px)) | (referenced but not found in scanned components) |

Assessment: The radius scale is reasonable (4 levels), but the split between landing (`rounded-xl`) and app (`rounded-lg`) for same-level cards creates inconsistency. `--radius: 0.5rem` (8px) is the base; at 12px for cards, the scale would feel more contemporary.

### Shadows

| Value | Used on |
|-------|---------|
| `hover:shadow-sm` | KB item card on hover |
| `hover:shadow-md` | Proposal editor section card on hover |
| `shadow-md` | KB item dropdown menu (permanent) |
| `shadow-xl` | Modal dialog (permanent) |
| `shadow-lg shadow-indigo-500/25` | Landing CTA buttons |
| `shadow-lg shadow-indigo-500/10` | Landing Pro pricing card |
| `shadow-sm` | Input component (permanent) |

Assessment: App components mostly follow the elevation rule (shadows on elevated elements only). Landing page uses decorative colored shadows on CTAs — acceptable for marketing but uses off-token indigo color values.

### Transitions

All transitions are CSS class-based: `transition-colors`, `transition-opacity`, `transition-shadow`, `transition-transform`. No duration is explicitly set (browser defaults to 150ms for `transition-colors`). Zero Framer Motion animations exist.

---

## Priority Findings (Top 10 — Ranked by Severity × Impact)

| Priority | Severity | Finding | Impact | Routes affected |
|----------|----------|---------|--------|-----------------|
| 1 | CRITICAL | Dual token system — Shadcn CSS vars and pp-* hex tokens coexist; same semantic concepts resolve to different values | Every component, every route | All 10 |
| 2 | CRITICAL | No Framer Motion installed — entire motion system is CSS `transition-colors` only; no page transitions, no AnimatePresence, no spring physics | Navigation feel, interactive feedback | All 10 |
| 3 | CRITICAL | No skip-to-content link — keyboard users must tab through entire navigation on every page | WCAG 2.1 AA violation | All 10 |
| 4 | CRITICAL | Filter tabs missing ARIA tab roles — screen readers cannot interpret dashboard and KB filter tabs as tab widgets | Accessibility on 2 primary routes | /dashboard, /knowledge-base |
| 5 | CRITICAL | Centered hero with gradient text on landing — canonical AI-slop pattern; immediately signals "generated" to discerning users | Brand perception on primary conversion page | / |
| 6 | HIGH | 14+ unique off-token color values in use (blue-950, purple-950, cyan-950, slate-*, indigo-*, #060b18) | System consistency, maintenance cost | All routes |
| 7 | HIGH | 8 arbitrary font-size values (`text-[10px]` through `text-[15px]`) — no defined type scale | Detail quality, maintainability | Dashboard, KB, sidebar, editor |
| 8 | HIGH | Sub-44px touch targets: h-6/h-7 icon buttons on KB card, proposal card, editor | Mobile accessibility | /knowledge-base, /proposals, /proposals/[id] |
| 9 | HIGH | Dashboard loading state is spinner + text, not a skeleton — breaks loading state consistency pattern established by /proposals skeleton rows | Perceived performance, visual consistency | /dashboard |
| 10 | HIGH | ProposalCard clickable row is a `<div onClick>` — keyboard and AT users cannot activate it | Keyboard accessibility on primary list surface | /dashboard, /proposals |

---

## Phase 1 Inputs

The following must be resolved by the Design System Architect in Phase 1:

1. **Token unification decision**: Collapse Shadcn CSS vars into pp-* system OR map pp-* tokens to CSS vars. One system only.
2. **Type scale definition**: Define 6–8 font sizes in tailwind.config.ts. Eliminate all bracket notation sizes.
3. **Spacing standardization**: Resolve `px-2.5/py-1.5/gap-1.5` usage — either add half-step tokens or enforce whole-step only.
4. **Missing status tokens**: Add `pp-info` (blue), `pp-purple` (purple), `pp-cyan` for status badge coverage.
5. **Landing page redesign direction**: Define whether the landing page follows the same token system as the app (recommended) or is a separate marketing surface with its own tokens.
6. **Motion library decision**: Install Framer Motion v11 and define motion tokens (duration-fast, duration-normal, ease-out, spring-snappy).
7. **Card radius decision**: Standardize `rounded-lg` (8px) vs `rounded-xl` (12px) across all cards, modals, and containers.
