# /audit

You are the Phase 0 orchestrator for UI/UX uplift. Your job is to verify the target app, produce a UI surface map, then systematically crawl, screenshot, and evaluate every user-facing surface.

Input: The target application URL or local dev server. Use $ARGUMENTS if provided, otherwise detect from package.json or ask.

## Pre-flight (BEFORE any crawling)

1. **Build check**: Run `npm run build`. If it fails → "Build fails. Run claude-workflow-rescue first for functional fixes, then return here." STOP.
2. **Stack detection**: Check package.json for react/next, check for tailwind.config. If non-React or non-Tailwind → "This workflow requires React/Next.js + Tailwind CSS. Your stack is [detected]. Not compatible." STOP.
3. **Rescue baseline**: If `docs/reports/06-uiux-benchmark-report.md` exists (from prior rescue), read it as baseline context.
4. **Health gate**: If rescue health report exists with score <70 → "App health too low for visual uplift (score: [X]). Run rescue first." STOP.
5. **Initialize phase.json**: Copy templates/phase.json.template to phase.json if not exists. Set phase 0 status to "in-progress", startedAt to now.

## Surface Map (produce BEFORE agents run)

Produce docs/audit/00-surface-map.md:
- Framework: [detected from package.json]
- CSS strategy: [Tailwind version, config location]
- Existing design tokens: [grep for CSS custom properties, theme files]
- Component library: [Shadcn/Radix/MUI/custom]
- Route count: [estimated from app/ or pages/ directory]
- Dark mode: [class-based / media-query / none]
- Auth: [Clerk / NextAuth / custom / none]

## Agent Sequence

1. Route Crawler (@.claude/agents/phase-0/route-crawler.md)
   Produce: docs/audit/01-route-manifest.md + docs/audit/screenshots/
   Done when: every route screenshotted at 3 viewports, manifest lists all routes
   **Checkpoint:** Verify file exists and has >10 lines. Re-run if stub.

2. Visual Quality Auditor (@.claude/agents/phase-0/visual-quality-auditor.md)
   Produce: docs/audit/02-visual-quality-report.md + docs/audit/02-computed-styles.json
   Done when: every route evaluated against 7 principles, Lighthouse + axe-core baselines captured
   **Tip:** Use `node scripts/extract-computed-styles.js <url>` to extract styles programmatically.
   **Checkpoint:** Verify file exists, contains severity table, has >50 lines. Re-run if stub.

3. Interaction & Accessibility Auditor (@.claude/agents/phase-0/interaction-auditor.md)
   Produce: docs/audit/03-interaction-report.md
   Done when: every interactive element audited, keyboard nav tested, axe-core run
   **Tip:** Use `node scripts/audit-interactions.js <url> --mobile` for touch target measurement.
   **Checkpoint:** Verify file exists, contains interaction state table, has >30 lines. Re-run if stub.

## Phase gate check

- [ ] docs/audit/00-surface-map.md exists
- [ ] docs/audit/01-route-manifest.md exists and lists routes
- [ ] docs/audit/02-visual-quality-report.md exists with severity findings
- [ ] docs/audit/02-computed-styles.json exists
- [ ] docs/audit/03-interaction-report.md exists

Update phase.json: phase 0 complete.

## On completion

Report: routes discovered, quality score, finding counts, top 3 findings.
"Review the gap reports in docs/audit/. If you agree the uplift is worth pursuing, run /design to begin Phase 1."
User decides GO/NO-GO. This is USER DECISION #1.
