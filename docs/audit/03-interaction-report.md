# Interaction & Accessibility Report: ProposalPilot

## Summary

Interactive elements audited: 47  
Elements missing hover state: 12  
Elements missing focus-visible: 14  
Elements missing active state: 47 (zero `active:` classes anywhere in codebase)  
Elements missing disabled state: 8  
Keyboard navigation: FAIL on `/dashboard`, `/proposals`, `/knowledge-base`, `/settings` (filter tabs); PASS on modal dialogs (Radix); PARTIAL on `/proposals/[id]`  
ARIA violations: 14 total — 4 CRITICAL, 6 SERIOUS, 4 MODERATE  
Touch targets below 44px: 11  
Color-only indicators: 4  

---

## Interaction State Audit

| Element | Route | Hover | Focus-visible | Active | Disabled | Evidence |
|---------|-------|-------|---------------|--------|----------|---------|
| Button atom (default/sm/lg) | All | ✅ via variant | ✅ `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | ❌ Missing | ✅ `disabled:pointer-events-none disabled:opacity-50` | `src/components/atoms/button.tsx:7` |
| Button atom (icon size) | All | ✅ via variant | ✅ same as above | ❌ Missing | ✅ same | `src/components/atoms/button.tsx:25` |
| Input atom | All | ❌ No hover state | ✅ `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` | ❌ Missing | ✅ `disabled:cursor-not-allowed disabled:opacity-50` | `src/components/atoms/input.tsx:11–15` |
| Badge atom | All | ✅ hover per variant | ❌ Uses `focus:ring-2` NOT `focus-visible:ring-2` — mouse clicks also trigger ring | ❌ Missing | ❌ Missing | `src/components/atoms/badge.tsx:6` — `focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2` |
| Dashboard filter tabs (7 buttons) | `/dashboard` | ✅ `hover:bg-pp-background-elevated` (inactive only) | ❌ No focus-visible class | ❌ Missing | ❌ Missing | `src/app/(app)/dashboard/page.tsx:199–205` |
| Dashboard pagination buttons | `/dashboard` | ✅ via Button atom | ✅ via Button atom | ❌ Missing | ✅ `disabled={!hasPrev}` / `disabled={!hasNext}` | `src/app/(app)/dashboard/page.tsx:282–294` |
| ProposalCard row (div onClick) | `/dashboard`, `/proposals` | ✅ `hover:bg-pp-background-elevated` | ❌ No focus-visible — uses `<div onClick>` not a keyboard-focusable element | ❌ Missing | N/A | `src/components/molecules/proposal-card.tsx:51–53` — `<div className="group flex cursor-pointer ...` |
| ProposalCard "..." button | `/dashboard`, `/proposals` | ✅ via Button ghost variant | ✅ via Button atom | ❌ Missing | N/A | `src/components/molecules/proposal-card.tsx:103–112` — invisible on non-hover (`opacity-0 group-hover:opacity-100`) |
| Proposals list row button | `/proposals` | ✅ `hover:bg-pp-background-elevated/40` | ❌ No focus-visible class | ❌ Missing | N/A | `src/app/(app)/proposals/page.tsx:82–84` — `className="flex w-full ... hover:bg-pp-background-elevated/40"` |
| Knowledge base type filter tabs | `/knowledge-base` | ❌ Inactive hover: `hover:bg-pp-background-elevated` produces no visual change (same as bg) | ❌ No focus-visible class | ❌ Missing | ❌ Missing | `src/app/(app)/knowledge-base/page.tsx:163–166` — active: `bg-primary text-primary-foreground`, inactive: `bg-pp-background-elevated ... hover:bg-pp-background-elevated` (no change) |
| Settings tab buttons (3) | `/settings` | ✅ `hover:text-pp-foreground` | ❌ No focus-visible class | ❌ Missing | ❌ Missing | `src/app/(app)/settings/page.tsx:71–79` |
| Sidebar nav links | All app routes | ✅ `hover:bg-pp-background-elevated` (inactive) | ❌ No focus-visible class — uses `<Link>` with only `transition-colors` | ❌ Missing | N/A | `src/components/organisms/sidebar.tsx:70–79` |
| Sidebar "Get started" link | All app routes | ✅ same | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/organisms/sidebar.tsx:87–97` |
| Mobile nav toggle button | All app (mobile) | ✅ via Button ghost | ✅ via Button atom | ❌ Missing | N/A | `src/components/templates/app-shell.tsx:22–29` |
| ThemeToggle button | All app routes | ✅ via Button ghost | ✅ via Button atom | ❌ Missing | N/A | `src/components/molecules/theme-toggle.tsx:11–26` |
| NewProposalDialog: Close button (X) | `/dashboard`, `/proposals` | ✅ via Button ghost | ✅ via Button atom | ❌ Missing | ✅ `disabled={isPending}` | `src/components/organisms/new-proposal-dialog.tsx:98–106` |
| NewProposalDialog: RFP picker button | `/dashboard`, `/proposals` | ✅ `hover:border-primary/60 hover:text-foreground` | ❌ No focus-visible class | ❌ Missing | ✅ `disabled:cursor-not-allowed disabled:opacity-50` | `src/components/organisms/new-proposal-dialog.tsx:141–145` |
| NewProposalDialog: Cancel / Create buttons | `/dashboard`, `/proposals` | ✅ via Button atom | ✅ via Button atom | ❌ Missing | ✅ | `src/components/organisms/new-proposal-dialog.tsx:175–189` |
| KBSearchPanel: Go button | `/proposals/[id]` | ✅ via Button outline | ✅ via Button atom | ❌ Missing | ✅ `disabled={searching \|\| !query.trim()}` | `src/components/organisms/kb-search-panel.tsx:92–100` |
| KBSearchPanel: search input | `/proposals/[id]` | ❌ No hover | ❌ Uses `focus:outline-none focus:ring-1 focus:ring-ring` NOT `focus-visible:` | ❌ Missing | N/A | `src/components/organisms/kb-search-panel.tsx:89` |
| KBSearchPanel: result item buttons | `/proposals/[id]` | ✅ `hover:border-pp-border hover:bg-accent` (unselected only) | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/organisms/kb-search-panel.tsx:136–141` |
| RequirementsSidebar: requirement buttons | `/proposals/[id]` | ✅ `hover:border-pp-border hover:bg-accent hover:text-pp-foreground` | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/organisms/requirements-sidebar.tsx:125–130` |
| UploadDropzone: remove file buttons | `/onboarding`, `/settings/brand-voice` | ✅ `hover:text-foreground` | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/organisms/upload-dropzone.tsx:117–121` |
| KBUploadForm: file picker button | `/knowledge-base` | ✅ `hover:border-primary/60 hover:text-foreground` | ❌ No focus-visible class | ❌ Missing | ✅ `disabled:cursor-not-allowed disabled:opacity-50` | `src/components/organisms/kb-upload-form.tsx:87–91` |
| KBUploadForm: close button | `/knowledge-base` | ✅ via Button ghost | ✅ via Button atom | ❌ Missing | ✅ `disabled={isProcessing}` | `src/components/organisms/kb-upload-form.tsx:73–79` |
| KBItemCard: title expand button | `/knowledge-base` | ❌ No hover class | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/molecules/kb-item-card.tsx:71–78` — `className="text-left"` with no interactive states |
| KBItemCard: "..." menu button | `/knowledge-base` | ✅ via Button ghost | ✅ via Button atom | ❌ Missing | N/A | `src/components/molecules/kb-item-card.tsx:93–100` — only visible on group-hover (`opacity-0 group-hover:opacity-100`) |
| KBItemCard: dropdown menu items | `/knowledge-base` | ✅ `hover:bg-accent` / `hover:bg-destructive/5` | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/molecules/kb-item-card.tsx:107–130` |
| BrandVoice: remove sample button | `/settings/brand-voice` | ✅ `hover:bg-destructive/10 hover:text-destructive` | ❌ No focus-visible class | ❌ Missing | N/A | `src/app/(app)/settings/brand-voice/brand-voice-client.tsx:71–75` |
| BrandVoice dropzone label | `/settings/brand-voice` | ✅ `hover:border-pp-accent/40 hover:bg-pp-background-elevated/30` | ❌ No focus-visible class on the `<label>` | ❌ Missing | N/A | `src/app/(app)/settings/brand-voice/brand-voice-client.tsx:165–173` |
| Editor toolbar buttons (B/I/H2/H3/UL/OL/Undo/Redo) | `/proposals/[id]` | ✅ `hover:bg-accent hover:text-accent-foreground` | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/organisms/proposal-editor/editor-toolbar.tsx:22–31` |
| Editor: Generate button | `/proposals/[id]` | ✅ via Button atom | ✅ via Button atom | ❌ Missing | ✅ `disabled={generateContext.requirements.length === 0}` | `src/components/organisms/proposal-editor/index.tsx:276–281` |
| Editor: Regenerate button | `/proposals/[id]` | ✅ via Button ghost | ✅ via Button atom | ❌ Missing | ✅ `disabled` | `src/components/organisms/proposal-editor/index.tsx:249–259` |
| Editor: error Dismiss button | `/proposals/[id]` | ✅ `hover:underline` | ❌ No focus-visible class | ❌ Missing | N/A | `src/components/organisms/proposal-editor/index.tsx:305–310` |
| RFP drop zone (role=button) | `/proposals/[id]` | ✅ `hover:border-primary/50 hover:bg-pp-background-elevated/40` | ❌ Only `tabIndex={0}` set; no focus-visible ring class | ❌ Missing | N/A | `src/app/(app)/proposals/[id]/_components/rfp-upload-panel.tsx:68–78` |
| Landing: "Get Started Free" CTA | `/` | ✅ `hover:bg-indigo-500` | ✅ `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500` | ❌ Missing | N/A | `src/app/_components/landing/hero.tsx:37` |
| Landing: "See how it works" CTA | `/` | ✅ `hover:border-slate-600 hover:text-white` | ❌ No focus-visible class | ❌ Missing | N/A | `src/app/_components/landing/hero.tsx:41–48` |
| Landing nav anchor links (How it works / Features / Pricing) | `/` | ✅ `hover:text-white` | ❌ No focus-visible class | ❌ Missing | N/A | `src/app/_components/landing/nav.tsx:16–24` |
| Landing nav: Sign in link | `/` | ✅ `hover:text-white` | ❌ No focus-visible class | ❌ Missing | N/A | `src/app/_components/landing/nav.tsx:28–32` |
| Landing nav: "Get started" button | `/` | ✅ `hover:bg-indigo-500` | ❌ No focus-visible class | ❌ Missing | N/A | `src/app/_components/landing/nav.tsx:33–39` |
| RFP error: Dismiss button | `/proposals/[id]` | ✅ `hover:underline` | ❌ No focus-visible class | ❌ Missing | N/A | `src/app/(app)/proposals/[id]/_components/rfp-upload-panel.tsx:119–124` |
| Proposal editor: top-bar KB toggle | `/proposals/[id]` | ✅ via Button | ✅ via Button atom | ❌ Missing | N/A | `src/app/(app)/proposals/[id]/page.tsx:109–124` — uses `title` attr not `aria-label` |
| Proposal editor: DOCX export | `/proposals/[id]` | ✅ via Button outline | ✅ via Button atom | ❌ Missing | ✅ `disabled={isExporting \|\| !hasAnyContent}` | `src/app/(app)/proposals/[id]/page.tsx:125–138` |
| Proposal editor: PDF export | `/proposals/[id]` | ✅ via Button | ✅ via Button atom | ❌ Missing | ✅ | `src/app/(app)/proposals/[id]/page.tsx:139–151` |

---

## Keyboard Navigation

| Route | Tab order | All reachable | Enter/Space | Escape closes modals | Skip link |
|-------|-----------|---------------|-------------|---------------------|-----------|
| `/` (Landing) | Logical (nav → hero → sections) | Partial — anchor `<a href="#section">` links and Sign-in/Get-started are reachable; hero secondary CTA missing focus ring so keyboard users can't see focus | ✅ Links work with Enter | N/A | ❌ No skip link |
| `/dashboard` | Partial — tab order reaches the "New Proposal" button, but filter tabs are `<button>` elements with no `role="tablist"` or `role="tab"` structure | ❌ ProposalCard rows use `<div onClick>` — NOT reachable via keyboard | ✅ Button atoms work | ✅ Radix Dialog handles Escape | ❌ No skip link |
| `/proposals` | Partial | ❌ Proposal list rows use `<button type="button">` — reachable, but no focus-visible ring visible | ✅ | ✅ Radix Dialog handles Escape | ❌ No skip link |
| `/proposals/[id]` | Complex 3-panel layout; top-bar buttons reachable; sidebar requirement buttons reachable but no focus ring | ❌ RFP dropzone has `tabIndex={0}` but no visible focus ring | ✅ Enter on RFP dropzone via `onKeyDown` | N/A (no modal) | ❌ No skip link |
| `/knowledge-base` | Partial — search input and Upload button reachable; filter tab buttons reachable but no ring | ❌ KBItemCard "..." button is `opacity-0` until group-hover — keyboard users cannot discover it | ❌ KBItemCard custom dropdown has no arrow-key navigation (not Radix DropdownMenu) | N/A | ❌ No skip link |
| `/settings` | Logical for tab buttons + form inputs | ✅ All buttons reachable | ✅ | N/A | ❌ No skip link |
| `/settings/brand-voice` | Logical for dropzone label + buttons | ✅ Reachable | ✅ | N/A | ❌ No skip link |
| `/onboarding` | Logical | ✅ | ✅ | N/A | ❌ No skip link |

**Notes:**
- The root layout (`src/app/layout.tsx`) has no skip-to-content link. Every route with a sidebar (all app routes) is unreachable without tabbing through the entire sidebar first.
- `tabIndex={-1}` issues: none found. One valid `tabIndex={0}` on the RFP drop zone `<div role="button">`.
- Radix Dialog (`NewProposalDialog`) correctly traps focus and responds to Escape. This is the only modal in the app and it is correctly implemented.
- The KBItemCard dropdown is a custom `<div>` menu, not a Radix `DropdownMenu` — no arrow-key navigation and no Escape-to-close support.

---

## ARIA Violations

| Issue | Impact | Element | Route | Fix |
|-------|--------|---------|-------|-----|
| ProposalCard row is a `<div>` with `onClick` | CRITICAL | `<div className="group flex cursor-pointer...">` | `/dashboard` | Replace with `<button type="button">` or `<Link>` — `<div onClick>` is not keyboard-focusable and not announced as interactive by screen readers |
| Filter tabs have no `role="tab"` / `role="tablist"` / `aria-selected` | CRITICAL | 7 `<button>` elements in `.dashboard/page.tsx:195` and 6 in `knowledge-base/page.tsx:159` | `/dashboard`, `/knowledge-base` | Wrap in `<div role="tablist">`, add `role="tab"` and `aria-selected={isActive}` to each button |
| Settings tab buttons have no `role="tab"` / `aria-selected` | CRITICAL | 3 `<button>` elements in `settings/page.tsx:67` | `/settings` | Same fix — `role="tablist"` + `role="tab"` + `aria-selected` |
| KBItemCard "..." button has no `aria-label` | CRITICAL | `<Button variant="ghost" size="icon" ...>` in `kb-item-card.tsx:93` | `/knowledge-base` | Add `aria-label={`Open menu for ${item.title}`}` — icon-only button with no accessible text |
| NewProposalDialog: `aria-describedby={undefined}` explicitly suppressed | SERIOUS | `<Dialog.Content aria-describedby={undefined}>` | `/dashboard`, `/proposals` | Add a visually hidden description or use `<Dialog.Description>`. Radix emits a console warning; screen readers receive no dialog description |
| Form inputs in `NewProposalDialog` have no `htmlFor`/`id` association | SERIOUS | `<label className="block ...">Title</label>` + `<Input>` at `new-proposal-dialog.tsx:112–121` | `/dashboard`, `/proposals` | Add `id="proposal-title"` to Input; add `htmlFor="proposal-title"` to label. Same for Client name and RFP fields |
| Settings Organisation form: label has no `htmlFor` | SERIOUS | `<label className="block ...">Organisation name</label>` + `<Input>` at `settings/page.tsx:87–95` | `/settings` | Add `id="org-name"` to Input; `htmlFor="org-name"` to label |
| KB Upload Form: Type and Title labels have no `htmlFor` | SERIOUS | `<label>Type</label>` and `<label>Title</label>` at `kb-upload-form.tsx:121,140` | `/knowledge-base` | Add `id="kb-type"` / `id="kb-title"` to fields; `htmlFor` to labels |
| Proposal editor top-bar KB toggle uses `title` not `aria-label` | SERIOUS | `<Button ... title="Show knowledge base panel">` at `proposals/[id]/page.tsx:114` | `/proposals/[id]` | Change `title` to `aria-label` — `title` is only visible on mouse hover; screen readers use `aria-label` |
| KBItemCard custom dropdown has no keyboard support | SERIOUS | Custom `<div>` dropdown at `kb-item-card.tsx:105–131` | `/knowledge-base` | Replace with Radix `DropdownMenu` — provides arrow-key navigation, Escape-to-close, and proper ARIA roles |
| `<aside>` landmarks in `RequirementsSidebar` and `KBSearchPanel` have no `aria-label` | MODERATE | `<aside>` at `requirements-sidebar.tsx:54,78,99` and `kb-search-panel.tsx:68` | `/proposals/[id]` | Add `aria-label="Requirements"` and `aria-label="Knowledge base search"` to distinguish multiple landmark regions |
| Root layout has no skip-to-content link | MODERATE | `src/app/layout.tsx` | All routes | Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>` as first child of `<body>`, add `id="main-content"` to `<main>` in AppShell |
| No `lang` attribute conflict — present on `<html lang="en">` | ✅ Pass | `src/app/layout.tsx:31` | All | No action needed |
| BrandVoice dropzone label wraps hidden input but focuses as interactive | MODERATE | `<label htmlFor="sample-upload">` at `brand-voice-client.tsx:165` | `/settings/brand-voice` | Add `tabIndex={0}` and `role="button"` to the label, or restructure as a `<button>` that triggers a hidden input |

---

## Touch Target Audit (Mobile 375px)

| Element | Route | Estimated size | Below 44px? |
|---------|-------|---------------|-------------|
| KBItemCard "..." menu button | `/knowledge-base` | `h-6 w-6` = 24×24px | ❌ YES — critically small, also hidden until hover |
| NewProposalDialog close (X) button | `/dashboard`, `/proposals` | `h-7 w-7` = 28×28px | ❌ YES |
| KBUploadForm close (X) button | `/knowledge-base` | `h-7 w-7` = 28×28px | ❌ YES |
| ProposalCard "..." button | `/dashboard` | `h-7 w-7` = 28×28px | ❌ YES |
| Editor toolbar buttons (B/I/H2/H3/UL/OL/Undo/Redo) | `/proposals/[id]` | approx. `px-2 py-1` text-xs = ~24×24px | ❌ YES — 8 buttons |
| Dashboard filter tab buttons | `/dashboard` | `px-2.5 py-1.5 text-xs` = ~28×28px | ❌ YES — 7 buttons |
| Knowledge base type filter tabs | `/knowledge-base` | `px-2.5 py-1.5 text-xs` = ~28px tall | ❌ YES — 6 buttons |
| Settings tab buttons | `/settings` | `px-4 py-2.5 text-sm` = ~40px tall | ⚠️ BORDERLINE (40px, 4px short) |
| Mobile nav toggle button | All app routes (mobile) | `h-8 w-8` = 32×32px | ❌ YES |
| Sidebar nav links | All app routes | `px-3 py-2 text-sm` = ~36px tall | ⚠️ BORDERLINE (36px) |
| UploadDropzone remove (X) buttons | `/onboarding` | No explicit size | ❌ YES — icon button with `X className="h-3.5 w-3.5"` and minimal padding |
| ThemeToggle | All app routes | `size="icon"` default = `h-10 w-10` = 40×40px | ⚠️ BORDERLINE (40px) |

---

## Color-Only State Indicators

| Element | Route | State | Color used | Fix needed |
|---------|-------|-------|------------|------------|
| Proposal status badges in ProposalCard | `/dashboard` | Active state (DRAFT/IN_PROGRESS/REVIEW/WON/LOST) | Color is paired with text label (`STATUS_STYLES` + `PROPOSAL_STATUS_LABELS`) | ✅ PASS — text accompanies color |
| Requirement priority badges (high/medium/low) | `/proposals/[id]` | Priority level | Badge variant (default/secondary/outline) is color only | ❌ FAIL — Badge shows "high"/"medium"/"low" text but uses `default`/`secondary`/`outline` variants with no icon. Color-only differentiation for screen-context importance. Add priority icon (e.g., `ArrowUp`/`Minus`/`ArrowDown`) |
| Confidence score on proposal sections | `/proposals/[id]` | Generation quality | `bg-pp-success-bg`/`bg-pp-warning-bg`/`bg-pp-danger-bg` — color categories the score | ✅ PASS — percentage text accompanies (`"72% confidence"`) |
| "Active" badge on billing plan | `/settings` | Subscription active status | `bg-pp-success-bg text-pp-success-text` span with no icon | ❌ FAIL — `<span className="...bg-pp-success-bg...">Active</span>` — colorblind users relying on the green hue alone may miss the active state. Add a `Check` icon before "Active" |
| Deadline "Overdue" in ProposalCard | `/dashboard` | Date past deadline | `text-pp-danger-text` applied conditionally to the deadline cell | ❌ FAIL — color change (muted → danger red) is the only indicator. Add `AlertCircle` or `!` prefix icon alongside the "Overdue" text |
| Save state indicator in editor | `/proposals/[id]` | Saved / saving | `text-pp-success-text` on "Saved" text | ✅ PASS — Check icon + "Saved" text |

---

## Remediation Priority List

### P0 — CRITICAL (keyboard traps / non-interactive interactive elements)

**1. ProposalCard `<div onClick>` — not keyboard accessible**  
File: `src/components/molecules/proposal-card.tsx:49–53`  
Fix: Replace outermost `<div className="group flex cursor-pointer...">` with `<button type="button" className="group flex w-full...">`. Add `focus-visible:ring-2 focus-visible:ring-ring` to its className. This makes every proposal row reachable via Tab and activated via Enter.

**2. All filter tabs missing `role="tablist"` / `role="tab"` / `aria-selected`**  
Files: `src/app/(app)/dashboard/page.tsx:187–219`, `src/app/(app)/knowledge-base/page.tsx:154–183`, `src/app/(app)/settings/page.tsx:66–81`  
Fix: Wrap tab containers in `<div role="tablist">`, add `role="tab"` and `aria-selected={isActive}` to each `<button>`. Screen readers currently announce these as plain buttons with no tab semantics.

**3. No skip-to-content link**  
File: `src/app/layout.tsx`  
Fix: Add `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium">Skip to content</a>` as the first child of `<body>`. Add `id="main-content"` to `<main className="flex-1 overflow-y-auto p-6">` in `src/components/templates/app-shell.tsx:38`.

**4. KBItemCard "..." icon button has no accessible text**  
File: `src/components/molecules/kb-item-card.tsx:93–101`  
Fix: Add `aria-label={`Open menu for ${item.title}`}` to the Button.

### P1 — SERIOUS (form labels unassociated, dialog description missing)

**5. All form inputs missing `id`/`htmlFor` association**  
Files: `src/components/organisms/new-proposal-dialog.tsx:112–121,125,135`, `src/app/(app)/settings/page.tsx:87–95`, `src/components/organisms/kb-upload-form.tsx:121,140`  
Fix: Add matching `id` props to every `<Input>` and `htmlFor` to every `<label>`. Example: `<Input id="proposal-title" ...>` + `<label htmlFor="proposal-title">`.

**6. `NewProposalDialog` has `aria-describedby={undefined}`**  
File: `src/components/organisms/new-proposal-dialog.tsx:90`  
Fix: Remove `aria-describedby={undefined}` override. Add `<Dialog.Description className="sr-only">Create a new proposal by providing a title, optional client name, and optional RFP document.</Dialog.Description>` inside `Dialog.Content`.

**7. KBItemCard custom dropdown — replace with Radix DropdownMenu**  
File: `src/components/molecules/kb-item-card.tsx:92–134`  
Fix: Replace custom `<div>` dropdown implementation (no keyboard navigation, no Escape support, no ARIA roles) with `@radix-ui/react-dropdown-menu`. Radix DropdownMenu provides `role="menu"`, `role="menuitem"`, arrow-key navigation, and Escape-to-close automatically.

**8. Proposal editor KB toggle button uses `title` instead of `aria-label`**  
File: `src/app/(app)/proposals/[id]/page.tsx:114`  
Fix: Change `title={showKbPanel ? "Hide knowledge base panel" : "Show knowledge base panel"}` to `aria-label={...}`.

### P2 — HIGH (missing focus-visible rings on custom interactive elements)

**9. Add `focus-visible:` ring to all custom button/link elements**  
The following elements have hover states but no keyboard focus ring — keyboard users cannot see focus position:
- Sidebar nav `<Link>` elements — `src/components/organisms/sidebar.tsx:66–79`
- Dashboard/KB/Settings filter tab buttons
- Proposals list row buttons — `src/app/(app)/proposals/page.tsx:82`
- KBItemCard expand button — `src/components/molecules/kb-item-card.tsx:71`
- KBItemCard dropdown menu items — `src/components/molecules/kb-item-card.tsx:107–130`
- Editor toolbar buttons — `src/components/organisms/proposal-editor/editor-toolbar.tsx:22`
- KBSearchPanel input uses `focus:ring-1` not `focus-visible:ring-1`  

Fix pattern: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1` to every custom interactive element's className.

**10. Badge atom uses `focus:ring` not `focus-visible:ring`**  
File: `src/components/atoms/badge.tsx:6`  
Current: `"...focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"`  
Fix: Change `focus:` to `focus-visible:` — prevents mouse clicks from triggering the focus ring, which is visually noisy and non-standard.

### P3 — MEDIUM (touch targets and active states)

**11. Touch targets below 44px on mobile**  
Elements: KBItemCard "..." (`h-6 w-6`), dialog close X (`h-7 w-7`), mobile nav toggle (`h-8 w-8`), all editor toolbar buttons, all filter tab buttons.  
Fix: Increase minimum touch target to `h-11 w-11` (44px) for icon buttons. For toolbar and filter buttons, add `min-h-[44px]` on mobile via responsive classes. For icon-only buttons at `h-7`/`h-6`, switch to `h-10 w-10` or use padding to create a larger hit area: `p-2` around a `h-4 w-4` icon = 32px + 8px padding = 40px (still borderline — prefer `h-11`).

**Zero `active:` classes exist anywhere in the codebase.** Every interactive element is missing press feedback. The Button atom, all custom buttons, all links — none have `active:scale-95` or `active:opacity-80`. Fix: Add `active:scale-[0.98]` to the Button atom base class at `src/components/atoms/button.tsx:7`, and `active:opacity-80` to custom `<button>` and `<Link>` elements. This single change cascades to all Button usages across all routes.
