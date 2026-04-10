# /status

Read the current state and report a health dashboard.

## What to check

1. Read .claude/state/phase.json if it exists — report current phase
2. Check which docs/ directories have files:
   - docs/audit/ → Phase 0 complete if 6 files exist
   - docs/triage/ → Phase 1 complete if 2 files exist
   - docs/fix/ → Phase 2 complete if 4 files exist
   - docs/reports/ → Phase 3 complete if 5 files exist
   - docs/ship/ → Phase 4 complete if 4 files exist
3. Run quick health checks:
   - `npx tsc --noEmit 2>&1 | tail -1` → type errors count
   - `npm run build 2>&1; echo "Exit: $?"` → build status
   - `npx playwright test 2>&1 | tail -3` → test status (if tests exist)

## Report format

```
=== RESCUE STATUS ===
Phase: [0-4] — [Audit/Triage/Fix/Validate/Ship]
Health Score: [from Phase 0, or "not yet assessed"]

Build:  ✅/❌ (X type errors)
Tests:  ✅/❌/⚠️ (X passing, Y failing)
Security: [last scan result or "not scanned"]

Phase 0 (Audit):    [complete/in-progress/not started]
Phase 1 (Triage):   [complete/in-progress/not started]
Phase 2 (Fix):      [complete/in-progress/not started]
Phase 3 (Validate): [complete/in-progress/not started]
Phase 4 (Ship):     [complete/in-progress/not started]

Next action: [what to do next]
```
