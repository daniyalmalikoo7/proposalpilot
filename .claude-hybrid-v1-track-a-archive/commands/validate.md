You are a Validation Orchestrator. You coordinate 5 specialist agents to produce a full Phase 3 validation pass.

## Pre-flight

Before launching agents, confirm Phase 2 is complete:

```bash
cat .claude/state/phase.json
```

If Phase 2 status is not `"complete"`, STOP and report: "Phase gate blocked — Phase 2 (Build) must be complete before /validate."

Confirm the app builds cleanly:

```bash
npx tsc --noEmit 2>&1 | tail -5
npm run lint 2>&1 | tail -5
npm run build 2>&1 | tail -10
```

If any of these fail, STOP and report the failure. Do not run agents on broken code.

## Agent Missions

Run each agent in sequence. Each writes its report to `docs/reports/`.

---

### Agent 1 — QA Lead (Playwright E2E)

**Mission**: Run all Playwright tests and report results.

```bash
npx playwright test --reporter=list 2>&1
```

Check:

- [ ] All tests pass
- [ ] Auth flow covered
- [ ] Proposal creation covered
- [ ] AI generation covered
- [ ] KB upload/search covered

Write report to `docs/reports/qa-report.md`:

```
# QA Report
_Generated: [date]_

## Summary
- Total tests: N
- Passed: N
- Failed: N
- Skipped: N

## Failures
[list each failure with test name + error]

## Coverage Gaps
[flows not covered by tests]

## Verdict: PASS | FAIL
```

---

### Agent 2 — Performance Engineer

**Mission**: Measure all critical endpoints against budget.

Performance budgets (from `.claude/skills/performance-budget.md`):

- API endpoints: p95 < 500ms
- AI streaming: first token < 2s
- Page load (LCP): < 2.5s
- JS bundle: < 200KB gzipped

Steps:

```bash
# Check bundle size
npm run build 2>&1 | grep -E "Page|Size|First"

# Check for large dependencies
npx next-bundle-analyzer 2>/dev/null || echo "analyzer not configured"
```

Write report to `docs/reports/performance-report.md`:

```
# Performance Report
_Generated: [date]_

## Bundle Analysis
[sizes per route]

## Budget Violations
[any routes/bundles exceeding budget]

## Verdict: PASS | FAIL
```

---

### Agent 3 — Security Engineer

**Mission**: Scan for secrets, test auth bypass vectors, verify input sanitization.

Steps:

```bash
# Scan for hardcoded secrets
grep -r "sk-\|AKIA\|ghp_\|password.*=.*['\"]" src/ --include="*.ts" --include="*.tsx" -l

# Verify auth middleware protects all app routes
cat src/middleware.ts

# Check for unprotected API routes
grep -r "export.*async.*function.*handler\|export.*default" src/app/api/ --include="*.ts" -l

# Verify no console.log in production code
grep -r "console\.log\|console\.error\|console\.warn" src/ --include="*.ts" --include="*.tsx" -l | grep -v "\.test\." | grep -v "__tests__"

# Check for SQL injection vectors (raw queries)
grep -r "prisma\.\$queryRaw\|prisma\.\$executeRaw" src/ --include="*.ts" -l

# Audit dependencies
npm audit --audit-level=high 2>&1 | tail -20
```

Write report to `docs/reports/security-report.md`:

```
# Security Report
_Generated: [date]_

## Findings

### CRITICAL
[list]

### HIGH
[list]

### MEDIUM
[list]

### LOW
[list]

## Dependency Audit
[npm audit summary]

## Verdict: PASS | FAIL
```

---

### Agent 4 — Accessibility Engineer

**Mission**: Run Lighthouse on all pages and verify WCAG 2.1 AA compliance.

Steps:

```bash
# Check if app is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "NOT RUNNING"

# If running, check for common a11y issues in source
grep -r "alt=" src/components/ --include="*.tsx" | grep 'alt=""' | head -10
grep -r "<button" src/components/ --include="*.tsx" | grep -v "aria-\|type=" | head -10
grep -r "onClick" src/components/ --include="*.tsx" | grep "<div\|<span" | head -10
```

Check source for:

- [ ] All images have descriptive `alt` attributes
- [ ] All interactive elements have `aria-label` or visible text
- [ ] No click handlers on non-interactive elements (divs/spans)
- [ ] Color contrast meets AA (verify Tailwind color choices)
- [ ] Forms have associated labels

Write report to `docs/reports/accessibility-report.md`:

```
# Accessibility Report
_Generated: [date]_

## WCAG 2.1 AA Checklist
[per-item results]

## Findings
### CRITICAL
### HIGH
### MEDIUM

## Verdict: PASS | FAIL
```

---

### Agent 5 — Code Reviewer

**Mission**: Check all source files against the architecture invariants in CLAUDE.md.

Check each invariant:

1. **No God Files** — find files over 250 lines: `find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20`
2. **Type Everything** — `grep -r ": any\b\|as any\b" src/ --include="*.ts" --include="*.tsx" -l`
3. **No Business Logic in UI** — scan page/component files for non-render logic
4. **Immutable by Default** — check for `let` where `const` is appropriate
5. **No console.log** — `grep -r "console\." src/ --include="*.ts" --include="*.tsx" -l | grep -v test`
6. **Structured Logger** — verify `src/lib/logger.ts` exists and is used
7. **Error Handling** — check async functions for try/catch coverage
8. **Prompt Versioning** — `ls docs/prompts/ 2>/dev/null || echo "MISSING"`

Write report to `docs/reports/code-review-report.md`:

```
# Code Review Report
_Generated: [date]_

## Invariant Violations

### CRITICAL (blocks ship)
[list with file:line]

### HIGH
[list with file:line]

### MEDIUM
[list with file:line]

## Verdict: PASS | FAIL
```

---

## Final Gate Check

After all 5 agents complete, verify:

```bash
ls docs/reports/
```

All 5 reports must exist:

- [ ] `docs/reports/qa-report.md`
- [ ] `docs/reports/performance-report.md`
- [ ] `docs/reports/security-report.md`
- [ ] `docs/reports/accessibility-report.md`
- [ ] `docs/reports/code-review-report.md`

Check for CRITICAL findings across all reports:

```bash
grep -l "CRITICAL" docs/reports/*.md 2>/dev/null
```

## Output

```
VALIDATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QA:            [PASS | FAIL]
Performance:   [PASS | FAIL]
Security:      [PASS | FAIL]
Accessibility: [PASS | FAIL]
Code Review:   [PASS | FAIL]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL findings: N
Phase 3 status: [COMPLETE if all pass | IN-PROGRESS if failures remain]
```

If all pass with zero CRITICAL findings:

- Update `.claude/state/phase.json`: set Phase 3 status to `"complete"`, Phase 4 to `"not-started"`
- Run: `git add .claude/state/ docs/reports/ && git commit -m "feat(workflow): Phase 3 validation complete — all gates pass"`

If any CRITICAL findings: "Run /fix to resolve CRITICAL findings, then re-run /validate."

$ARGUMENTS
