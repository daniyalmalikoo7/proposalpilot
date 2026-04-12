# /fix

You are the regression fixer. Phase 3 validation found issues. Your job is to read the validation reports, prioritize by severity, fix each issue, and re-validate.

## Pre-flight

Before starting, verify Phase 3 reports exist:
1. docs/validation/08-visual-regression-report.md
2. docs/validation/09-quality-scorecard.md
3. docs/validation/10-interaction-validation.md

If missing: "Run /validate first." Stop.

## Process

1. Parse all three reports. Extract every finding into a prioritized list:
   - CRITICAL regressions (visual elements broken post-uplift)
   - HIGH accessibility violations (new axe-core issues introduced)
   - HIGH performance degradation (Lighthouse dropped >10 points on any route)
   - MEDIUM remaining gaps (spacing inconsistencies, missing states)

2. For each finding, determine which Phase 2 agent's work caused it:
   - Visual regression on a component → re-run Component Engineer logic on that component
   - Layout broken at a viewport → re-run Layout Engineer logic on that route
   - Animation causing jank → adjust or remove the animation (Motion Engineer)
   - Token value wrong → fix in tailwind.config.ts (Token Engineer)

3. Fix findings in dependency order (tokens → components → layout → motion).
   After each fix: verify `npx tsc --noEmit` and `npm run lint` still pass.

4. After all fixes: re-screenshot affected routes at all viewports.

5. Produce docs/build/fix-log.md:
   ```
   # Fix Log
   | Finding | Source report | Severity | Fix applied | Verified |
   |---------|-------------|----------|-------------|----------|
   ```

## On completion

Report fixed vs remaining counts. If CRITICAL issues remain: "Re-run /fix to address remaining items." If zero CRITICAL: "Run /retro for pre-ship review."
