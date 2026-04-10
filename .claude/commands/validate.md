# /validate

You are the Phase 3 orchestrator. The codebase has been fixed. Now 5 independent validators assess quality. A security failure doesn't get waived because tests pass.

## Phase gate check (before starting)

Read buildCommand and typeCheckCommand from docs/audit/00-stack-profile.json (or use defaults: `npm run build`, `npx tsc --noEmit`).
Verify: build succeeds AND type check = zero errors. If either fails, STOP — run /fix first.

## Context injection

Load these artifacts to provide context to validation agents:
- docs/audit/00-system-map.md — system map for scope (routes to test, integrations to verify)
- docs/audit/00-stack-profile.json — tool commands and thresholds
- docs/audit/04-runtime-health.md — Phase 0 baseline for comparison
- docs/audit/03-security-scan.md — Phase 0 security baseline for comparison
- docs/fix/01-04 — what was fixed (for reviewing changes)

Summarize: pre-rescue health score, features tested in Phase 0, security findings from Phase 0, performance baselines.

## Phase state update

Update `.claude/state/phase.json`:
```
Set currentPhase: 3
Set phases.3.status: "in-progress"
Set phases.3.startedAt: current ISO timestamp
```

## Sequence

1. **QA Lead** (@.claude/agents/phase-3/qa-lead.md)
   Produce: docs/reports/01-qa-report.md
   Done when: full test suite run, gaps identified, comparison against Phase 0 baseline

2. **Performance Engineer** (@.claude/agents/phase-3/performance-engineer.md)
   Produce: docs/reports/02-performance-report.md
   Done when: Lighthouse ran, API latency measured, bundle size checked

3. **Security Engineer** (@.claude/agents/phase-3/security-engineer.md)
   Produce: docs/reports/03-security-report.md
   Done when: Semgrep re-ran (same rulesets as Phase 0), auth re-verified, IDOR re-checked, zero CRITICAL/HIGH

4. **Accessibility Engineer** (@.claude/agents/phase-3/accessibility-engineer.md)
   Produce: docs/reports/04-accessibility-report.md
   Done when: axe-core ran on all pages, keyboard nav tested

5. **Code Reviewer** (@.claude/agents/phase-3/code-reviewer.md)
   Produce: docs/reports/05-code-review.md
   Done when: all rescue commits reviewed, engineering standard verified

## Phase gate check

- [ ] All 5 reports exist in docs/reports/
- [ ] Zero CRITICAL findings across all reports
- [ ] Zero HIGH security findings (from 03-security-report.md)

## Phase state update

On completion, update `.claude/state/phase.json`:
```
Set phases.3.status: "completed"
Set phases.3.completedAt: current ISO timestamp
```

## On completion

Report per validator (1 sentence each), then:
- If all clear: "Run /retro for a multi-agent retrospective, then /ship to deploy"
- If findings: "Run /fix to address the findings, then /validate again"
