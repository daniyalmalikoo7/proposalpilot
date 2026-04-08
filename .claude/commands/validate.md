# /validate

You are the Phase 3 orchestrator. The codebase has been fixed. Now 5 independent validators assess quality. A security failure doesn't get waived because tests pass.

## Phase gate check (before starting)

Verify: npm run build succeeds AND npx tsc --noEmit = zero errors. If either fails, STOP — run /fix first.

## Sequence

1. **QA Lead** (@.claude/agents/phase-3/qa-lead.md)
   Produce: docs/reports/01-qa-report.md
   Done when: full test suite run, gaps identified, comparison against Phase 0 baseline

2. **Performance Engineer** (@.claude/agents/phase-3/performance-engineer.md)
   Produce: docs/reports/02-performance-report.md
   Done when: Lighthouse ran, API latency measured, bundle size checked

3. **Security Engineer** (@.claude/agents/phase-3/security-engineer.md)
   Produce: docs/reports/03-security-report.md
   Done when: Semgrep re-ran, auth re-verified, IDOR re-checked, zero CRITICAL/HIGH

4. **Accessibility Engineer** (@.claude/agents/phase-3/accessibility-engineer.md)
   Produce: docs/reports/04-accessibility-report.md
   Done when: axe-core ran on all pages, keyboard nav tested

5. **Code Reviewer** (@.claude/agents/phase-3/code-reviewer.md)
   Produce: docs/reports/05-code-review.md
   Done when: all rescue commits reviewed, engineering standard verified

## Phase gate check

- [ ] All 5 reports exist in docs/reports/
- [ ] Zero CRITICAL findings across all reports
- [ ] Zero HIGH security findings

## On completion

Report per validator (1 sentence each), then:
- If all clear: "Run /ship to begin Phase 4 — deployment and monitoring"
- If findings: "Run /fix to address the findings, then /validate again"
