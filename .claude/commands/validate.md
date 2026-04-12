# /validate

You are the Phase 3 orchestrator for UI/UX uplift. Phase 2 executed the migration. Your job is to produce EVIDENCE that the uplift succeeded — before/after screenshots, quality scorecards, accessibility comparisons. This is the proof.

## Pre-flight

Before starting, verify Phase 2 is complete:
1. docs/build/token-implementation-log.md exists
2. docs/build/component-migration-log.md exists
3. docs/build/layout-migration-log.md exists
4. docs/build/motion-implementation-log.md exists
5. `npx tsc --noEmit` passes clean

If any are missing or typecheck fails, say: "Phase 2 is incomplete. Run /uplift first." and stop.

## Sequence

1. Visual Regression Validator (@.claude/agents/phase-3/visual-regression-validator.md)
   Produce: docs/validation/screenshots-after/ + docs/validation/08-visual-regression-report.md
   Done when: all routes re-screenshotted, before/after compared, regressions classified

   **Checkpoint:** Verify report exists, screenshots-after/ has files, and zero CRITICAL regressions.
   If CRITICAL regressions found, report them and stop — they must be fixed before continuing.

2. Quality Score Assessor (@.claude/agents/phase-3/quality-score-assessor.md)
   Produce: docs/validation/09-quality-scorecard.md
   Done when: per-principle before/after scores, Lighthouse delta, axe-core delta

   **Checkpoint:** Verify report exists and contains before/after comparison tables.

3. Interaction & Accessibility Validator (@.claude/agents/phase-3/interaction-validator.md)
   Produce: docs/validation/10-interaction-validation.md
   Done when: all states re-tested, keyboard nav verified, axe-core re-run, touch targets verified

   **Checkpoint:** Verify report exists and contains interaction state comparison table.

## Phase gate check

Before completing, verify:
- [ ] docs/validation/08-visual-regression-report.md exists with PASS/FAIL verdict
- [ ] docs/validation/09-quality-scorecard.md exists with before/after scores
- [ ] docs/validation/10-interaction-validation.md exists with state audit
- [ ] Zero CRITICAL visual regressions
- [ ] Quality score improved (after > before)
- [ ] No new axe-core critical violations introduced

## On completion

Report:
- Visual regression: [PASS/FAIL, N regressions found]
- Quality score: [before] → [after] (+[improvement])
- Lighthouse average: [before] → [after]
- axe-core violations: [before] → [after]
- Interaction states: [before coverage] → [after coverage]
- Remaining issues: [N items with severity]
- If PASS: "Run /ship to begin Phase 4 — documentation and deployment."
- If FAIL: "Fix the [N] CRITICAL regressions, then re-run /validate."
