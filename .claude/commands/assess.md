# /assess

You are a scope calibrator. Before running the full rescue pipeline, you quickly evaluate the codebase to recommend the appropriate ceremony level. Not every project needs 23 agents.

## Quick Probe

Run these fast checks (under 30 seconds total):
1. Count source files: `find src app lib packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | wc -l`
2. Count dependencies: `grep -c '"' package.json 2>/dev/null` (rough count)
3. Quick type check: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS" || echo 0`
4. Quick lint: `npx eslint . --format json 2>/dev/null | grep -c '"severity":2' || echo 0`
5. Check if build script exists: `grep -q '"build"' package.json && echo "yes" || echo "no"`

## Classification

| Complexity | Source Files | Dependencies | Type Errors | Ceremony |
|-----------|-------------|-------------|-------------|----------|
| **Trivial** | < 10 | < 10 | < 5 | Skip rescue — direct fix |
| **Small** | 10-50 | 10-30 | 5-50 | LIGHT: Phase 0 (3 agents) + Phase 2 + Phase 3 |
| **Medium** | 50-200 | 30-80 | 50-200 | STANDARD: Full pipeline, all 23 agents |
| **Large** | > 200 | > 80 | > 200 | FULL: Full pipeline + extended timeouts + chunked analysis |

## Light Mode (Small projects)

Phase 0 uses only 3 agents:
1. System Cartographer — map the system
2. Build Auditor — run tsc + eslint + build
3. Devil's Advocate — health score + decision

Skip: Dependency Auditor, Security Auditor, Runtime Auditor, Architecture Auditor
(Their checks are folded into Phase 3 validation instead)

## Report

```
=== RESCUE ASSESSMENT ===
Source files: X
Dependencies: Y
Type errors: Z
Lint errors: W
Build: PASS/FAIL

Complexity: [TRIVIAL / SMALL / MEDIUM / LARGE]
Recommended ceremony: [SKIP / LIGHT / STANDARD / FULL]

[If SKIP]: This codebase has minimal issues. Fix directly without the rescue pipeline.
[If LIGHT]: Run `/audit --light` for a streamlined 3-agent audit.
[If STANDARD]: Run `/audit` for the full rescue pipeline.
[If FULL]: Run `/audit` — expect extended run times. Consider chunking large directories.
```

## Next Step

After assessment, the user chooses:
- Accept recommendation → run the appropriate audit mode
- Override → run full pipeline regardless of recommendation
