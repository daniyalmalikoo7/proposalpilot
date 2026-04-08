# /fix

You are the Phase 2 orchestrator. The fix plan is approved. Execute fixes in layer order. Deterministic fixes first, then LLM-powered fixes. Verify after each layer.

## Phase gate check (before starting)

Verify: docs/triage/02-fix-plan.md exists with work packages. If not, STOP and run /triage first.

## Pre-fix setup

1. Create a git tag for the pre-rescue state: `git tag pre-rescue-$(date +%Y%m%d) 2>/dev/null`
2. Create docs/fix/ directory if it doesn't exist

## Sequence

1. **Auto-Fixer** (@.claude/agents/phase-2/auto-fixer.md)
   Execute: Layer 0 from fix plan (prettier, eslint --fix, knip --fix, npm audit fix)
   Produce: docs/fix/01-auto-fixes.md
   Verify: npm run build passes
   Done when: all deterministic fixes applied and committed

2. **Build Fixer** (@.claude/agents/phase-2/build-fixer.md)
   Execute: Layer 1 from fix plan
   Produce: docs/fix/02-build-fixes.md
   Verify: npx tsc --noEmit = zero errors AND npm run build = success
   Done when: build is clean

3. **Feature Fixer** (@.claude/agents/phase-2/feature-fixer.md)
   Execute: Layers 2-3 from fix plan (security first, then features)
   Produce: docs/fix/03-feature-fixes.md
   Verify: re-run Semgrep for security, start app and test pages for features
   Done when: all CRITICAL/HIGH security and feature findings resolved

4. **Test Writer** (@.claude/agents/phase-2/test-writer.md)
   Execute: Layer 4 from fix plan
   Produce: tests/e2e/*.spec.ts + docs/fix/04-test-coverage.md
   Verify: npx playwright test = all green
   Done when: critical paths tested and passing

## Phase gate check

- [ ] npm run build succeeds
- [ ] npx tsc --noEmit = zero errors
- [ ] All fix reports exist in docs/fix/

## On completion

Report:
- Fixes applied: X auto, Y build, Z security, W feature
- Tests created: X test files covering Y features
- Build status: PASS/FAIL
- "Run /validate to begin Phase 3 — independent validation of the rescued codebase"
