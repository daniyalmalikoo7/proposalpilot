# Route Manifest: ProposalPilot

## Discovery method
Router: Next.js 15 App Router  
Entry point: http://localhost:3000  
Auth: Clerk (`@clerk/nextjs`)  
Total routes discovered: 10  
Total screenshots captured: 7 (3 public routes × desktop + mobile, sign-in/sign-up tablet skipped; home captured at 3 viewports)

---

## Route inventory

| # | Route | Auth required | Key components | States captured |
|---|-------|--------------|----------------|-----------------|
| 1 | `/` | No | LandingNav, LandingHero, ProblemSolution, HowItWorks, Features, Pricing, LandingFooter | Default (static) |
| 2 | `/sign-in` | No | Clerk `<SignIn />` | Default, loading (Clerk widget) |
| 3 | `/sign-up` | No | Clerk `<SignUp />` | Default, loading (Clerk widget) |
| 4 | `/onboarding` | Yes (Clerk) | OnboardingWizard (3-step), UploadDropzone, Button, Input | Step 1 / Step 2 / Step 3 / uploading / error |
| 5 | `/dashboard` | Yes (Clerk) | AppShell, Sidebar, stats grid (4 cards), ProposalCard, NewProposalDialog, filter tabs | Loading, Empty, Populated, Filter-empty |
| 6 | `/proposals` | Yes (Clerk) | AppShell, Sidebar, proposal list, Skeleton rows, NewProposalDialog | Loading skeletons, Empty state, Populated list |
| 7 | `/proposals/[id]` | Yes (Clerk) | 3-panel editor: RequirementsSidebar, EditorCenterPanel, KBSearchPanel, top-bar with save state + export | Loading spinner, Error, RFP upload step, Extracting, Sections populated, KB panel visible/hidden |
| 8 | `/knowledge-base` | Yes (Clerk) | AppShell, Sidebar, Search Input, type filter tabs, KBItemCard grid, KBUploadForm | Loading shimmer, Empty (no docs), Empty (search no results), Populated grid |
| 9 | `/settings` | Yes (Clerk) | AppShell, Sidebar, tab bar (Organization / Team / Billing), Input, Button | Org tab, Team tab, Billing tab, saving state, save success |
| 10 | `/settings/brand-voice` | Yes (Clerk) | BrandVoiceClient, dashed upload dropzone, SampleCard list, BrandVoiceProfileCard | Idle, Uploading, Samples listed, Analyzing, Done (profile card shown), Error |

---

## Screenshot directory

`docs/audit/screenshots/`

Files captured:
- `01-home-desktop.png` — `/` at 1440×900
- `01-home-tablet.png` — `/` at 768×1024
- `01-home-mobile.png` — `/` at 375×812
- `02-sign-in-desktop.png` — `/sign-in` at 1440×900
- `02-sign-in-mobile.png` — `/sign-in` at 375×812
- `03-sign-up-desktop.png` — `/sign-up` at 1440×900
- `03-sign-up-mobile.png` — `/sign-up` at 375×812

---

## Routes analyzed from source (auth-blocked)

The following 7 routes required active Clerk authentication. Screenshots could not be automated. Full source analysis below.

- `/onboarding` — source file: `src/app/(app)/onboarding/page.tsx`
- `/dashboard` — source file: `src/app/(app)/dashboard/page.tsx`
- `/proposals` — source file: `src/app/(app)/proposals/page.tsx`
- `/proposals/[id]` — source file: `src/app/(app)/proposals/[id]/page.tsx`
- `/knowledge-base` — source file: `src/app/(app)/knowledge-base/page.tsx`
- `/settings` — source file: `src/app/(app)/settings/page.tsx`
- `/settings/brand-voice` — source file: `src/app/(app)/settings/brand-voice/page.tsx` + `brand-voice-client.tsx`

---

## Non-default states captured / documented

### Loading states (found in source)
- **Dashboard proposals loading**: `Loader2` spinner + "Loading proposals…" text — inline within the proposal table area. Not a skeleton — plain spinner + text.
- **Proposals list loading**: 4 skeleton rows (Skeleton atoms for icon, title line, subtitle line, badge, date). Width-varied for natural feel.
- **Knowledge base loading**: 8-card shimmer skeleton grid using `bg-pp-background-card` border cards with Skeleton atoms. Uses `animate-shimmer` keyframe from Tailwind config.
- **Proposal editor loading**: Full-screen centered `Loader2` spinner.
- **Settings org loading**: Input placeholder shows "Loading…" with disabled state.
- **Brand voice uploading**: `Loader2` + "Extracting text…" inline text, no skeleton.

### Empty states (found in source)
- **Dashboard — no proposals**: Icon-free text block + "No proposals yet" headline + CTA button ("New Proposal"). Centered in table area.
- **Dashboard — filtered empty**: Text-only: "No proposals in this category." No icon, no CTA.
- **Proposals page — empty**: Circular icon container (FilePlus2, 56px) + headline + subtext + CTA. Centered, padded generously (py-16).
- **Knowledge base — empty**: Circular icon container (BookOpen, 56px) + headline + subtext + conditional CTA. Same pattern as proposals empty state.
- **Knowledge base — search empty**: Same icon container pattern, copy changes to "No results found" + "Try a different search term."
- **Requirements sidebar — empty**: Circular icon container (FileSearch, 40px) + "Upload an RFP to extract requirements automatically."
- **Requirements sidebar — loading**: 5 skeleton card items with 3 skeleton lines each.

### Error states (found in source)
- **Dashboard fetch error**: Plain `<p>` with `text-destructive` color. No icon. No retry button.
- **Proposal editor load error**: Full-screen centered `<p>` with `text-destructive`. No recovery action.
- **Onboarding upload error**: Inline alert block with AlertCircle icon + border-destructive/40 + bg-destructive/10. Dismissible only by re-trying.
- **Brand voice upload error**: Similar inline alert, uses AlertTriangle icon.
- **Settings save error**: Inline `<p className="text-sm text-destructive">` below the input. No toast.

### Interactive states (found in source)
- **New Proposal Dialog**: Modal dialog (`NewProposalDialog` organism) triggered from Dashboard and Proposals page "New Proposal" button.
- **KB Upload Form**: `KBUploadForm` organism toggled via "Upload Document" button — renders inline above search, not a modal.
- **KB Search panel** in editor: toggleable via top-bar "KB" button; collapses to free center-panel space.
- **Save state indicator** in editor top-bar: transitions between idle / "Saving…" (spinner) / "Saved" (Check icon + green text).

---

## Source analysis per route

### Route 1: `/` — Landing Page
The landing page is a long-scroll marketing page rendered entirely as a server component. The background is a hard-coded deep navy `#060b18` with an inline `<style>` that forces this colour onto `html` and `body` to prevent overscroll flash. The page is composed of 6 sequential sections: sticky nav → hero → problem-solution → how-it-works → features → pricing, plus a footer. The hero section is the primary slop risk: fully centered layout with a 600×600 indigo radial glow blur, gradient text on the H1 (`from-indigo-400 to-violet-400`), and a centered dual-CTA row. Two CTAs are provided — a solid indigo primary ("Get Started Free") and a slate ghost secondary ("See how it works"). No hero image or distinctive asset exists. The nav is a fixed frosted glass bar (backdrop-blur-md, 80% opacity background). The full scroll height is likely 3000–4000px on desktop. All section backgrounds share the same `#060b18` — sections are differentiated only by content, not by subtle background shifts.

### Route 2: `/sign-in` — Sign In
A minimalist wrapper around Clerk's hosted `<SignIn />` component. The page uses `bg-background` (a CSS variable — likely the app's dark token) and is a full-screen flex center. Clerk renders its own card widget with email/password fields, OAuth buttons, and links to sign-up. There is no custom branding layer, no ProposalPilot logo visible in the wrapper, and no context about what the user is signing in to. The page is very sparse — just the Clerk widget floating in the center of the viewport.

### Route 3: `/sign-up` — Sign Up
Structurally identical to sign-in: a full-screen centered `<SignUp />` Clerk widget on `bg-background`. Clerk handles all form fields, validation, OAuth, and confirmation flows. No custom elements surround the widget. The background colour may create a visual discontinuity between the dark landing page and the Clerk widget's own card styling, since Clerk's default widget appearance may not match the app's dark palette without Clerk appearance customization.

### Route 4: `/onboarding` — Onboarding Wizard
A 3-step wizard rendered in a constrained `max-w-2xl` centered column. The page header displays "Welcome to ProposalPilot" and a subtitle. Below it, `OnboardingWizard` renders a horizontal step indicator (numbered circles with ChevronRight separators, transitioning to filled/outlined states by step). Step 1 presents a file upload dropzone (UploadDropzone organism) for past proposals with a "Continue" button. Step 2 presents brand voice configuration — 3-button tone selector (Formal/Professional/Conversational), 3-button length selector (Concise/Balanced/Detailed), and an optional keywords text input. Step 3 shows a demo generation panel where users can trigger a sample "Executive Summary" and see streamed output. All error states use an inline alert block with AlertCircle. The wizard does not use a stepper progress bar — just the step indicator at top.

### Route 5: `/dashboard` — Dashboard
The primary app landing screen, wrapped in AppShell (sidebar + 11px top-bar with ThemeToggle + Clerk UserButton). The content area shows a page header ("Dashboard" + "Your proposal pipeline.") with a "New Proposal" button. Below is a 2×4 (mobile) / 4×1 (desktop) stats grid showing: Active proposals, Win Rate, Avg. Completion, Total — each as a card with a Lucide icon, a large mono number (or "No data yet" in small muted text), and a sub-label. The bulk of the page is a single bordered card containing: 7 filter tabs (All/Draft/In Progress/Review/Sent/Won/Lost with count badges), column headers (Title/Status/Deadline/Progress/Edited), and `ProposalCard` rows. Pagination appears below the list when >5 results. The `NewProposalDialog` modal is triggered by the header button and an in-table empty state CTA. All data is fetched via tRPC (`proposal.list`).

### Route 6: `/proposals` — Proposals List
A simpler version of the dashboard proposal view — a standalone list page without stats cards or filter tabs. The page shows a header ("Proposals" + "Manage your proposal pipeline.") with a "New Proposal" button. The content is a single bordered card with a "All Proposals" label row, then a plain `<ul>` of clickable rows. Each row shows: FileText icon, title + optional client name (truncated), status badge (rounded-full, muted background), and relative date. Loading state uses 4 skeleton rows. Empty state uses the FilePlus2 icon in a circle container with a CTA. Clicking any row navigates to `/proposals/[id]`. The `NewProposalDialog` modal is shared with dashboard.

### Route 7: `/proposals/[id]` — Proposal Editor
The most complex surface in the app. A full-height 3-panel layout that breaks out of the standard AppShell — it has its own 56px top bar instead of using the global header. The top bar contains: breadcrumb ("← Proposals / [title]"), save state indicator (idle/saving/saved), KB panel toggle button, DOCX export button, and PDF export button. The left panel (`RequirementsSidebar`, 288px wide) lists extracted RFP requirements grouped by section, with priority badges (high/medium/low) and selectable checkboxes. The center panel (`EditorCenterPanel`) is context-sensitive: shows RFP upload step if no RFP uploaded, extraction progress if extracting, section generation controls if requirements exist, and a rich text editor for each proposal section. The right panel (`KBSearchPanel`) is collapsible and shows knowledge base search results that can be pinned as context for generation. The save state has three visible states: silent idle, "Saving…" with spinner, and "Saved" with green Check icon. Export buttons show a Loader2 spinner when exporting.

### Route 8: `/knowledge-base` — Knowledge Base
A document library page wrapped in AppShell. The header shows the document count ("N documents · powers your AI generation") with an "Upload Document" button. Clicking Upload toggles `KBUploadForm` inline (above search, not in a modal). A search input with a Search icon (absolute positioned) provides real-time debounced (300ms) semantic search via `trpc.kb.search`. Six filter tabs (All/Case Studies/Past Proposals/Methodology/Team Bios/Capabilities) show counts in mono badges. The populated state is a responsive card grid: 2 columns mobile, 3 columns sm, 4 columns lg — each card is a `KBItemCard` with type badge, title, file size, upload date, and a delete button. Loading state is an 8-card shimmer skeleton grid matching the populated layout exactly. Two empty states exist: "Your knowledge base is empty" (with Upload CTA) and "No results found" (search mode, no CTA).

### Route 9: `/settings` — Settings
A tabbed settings page. The header reads "Settings" with a subtitle. Three tabs below the header: Organization, Team, Billing — using a bottom-border underline indicator (no animated slider). Organization tab: a single `max-w-lg` form with an "Organisation name" label + input + "Save changes" button. The button is disabled when the value matches the fetched value or is empty. A transient "Saved!" success text appears for 2.5 seconds after mutation success. Team tab: a placeholder state — "Team members are managed through Clerk" text + a disabled "Invite member" button + a bordered card with redirect instructions. Billing tab: a `max-w-lg` card showing plan name (large mono font), monthly limit, a "Manage billing" button (opens Stripe Customer Portal), and a disabled "Upgrade plan" button. A second card explains Stripe manages billing. All mutations show inline loading spinners.

### Route 10: `/settings/brand-voice` — Brand Voice Configuration
A settings sub-page in a `max-w-2xl` centered column. The page header describes the purpose: upload up to 5 past proposals for AI writing style extraction. The main interaction is a dashed-border dropzone (label element wrapping a hidden file input) that accepts PDF and DOCX. Uploaded files appear as `SampleCard` items — each showing FileText icon, filename, character count, and an X remove button. When samples are present, an "Extract Brand Voice (N samples)" button appears. During analysis, a `Loader2` spinner replaces the button text. On success, a `BrandVoiceProfileCard` component renders the extracted profile. A "Re-analyze" button appears to reset. Error states use an inline AlertTriangle alert block. The dropzone disables and reduces opacity when the 5-sample maximum is reached.
