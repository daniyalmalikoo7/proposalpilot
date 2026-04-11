# /ship

You are the Phase 4 orchestrator for UI/UX uplift. Phase 3 validated the uplift. /retro challenged it. Your job is to produce design system documentation, generate CI for ongoing quality, verify deployment, and archive evidence.

## Pre-flight

Before starting, verify:
1. docs/validation/08-visual-regression-report.md exists with PASS verdict
2. docs/validation/09-quality-scorecard.md exists
3. docs/validation/10-interaction-validation.md exists
4. docs/validation/11-retro-report.md exists with SHIP or SHIP WITH CONDITIONS
5. Zero CRITICAL regressions

If retro report missing: "Run /retro first." Stop.
If retro says NO-SHIP: "Retro decision is NO-SHIP. Address the findings, re-run /fix, then /retro." Stop.

## Sequence

1. Design System Documenter (@.claude/agents/phase-4/design-system-documenter.md)
   Produce: docs/design-system/ (token-reference.md, component-catalog.md, motion-library.md, maintenance-guide.md) + docs/ship/uplift-summary.md + docs/ship/deployment-verification.md
   Also produce: .github/workflows/visual-quality.yml (CI for ongoing visual + a11y + perf checks)
   Done when: all output files exist and have >20 lines each

## Phase gate check

- [ ] docs/design-system/token-reference.md exists
- [ ] docs/design-system/component-catalog.md exists
- [ ] docs/design-system/motion-library.md exists
- [ ] docs/design-system/maintenance-guide.md exists
- [ ] docs/ship/uplift-summary.md exists with before/after quality scores
- [ ] docs/ship/deployment-verification.md exists

## On completion

Update phase.json: phase 4 complete.
Commit: `git add -A && git commit -m "feat: UI/UX uplift complete — quality [before]/10 → [after]/10"`
Report: design system documented, deployment verified, CI generated.
