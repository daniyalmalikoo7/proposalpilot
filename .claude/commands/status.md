# /status

Read the current rescue state and report a comprehensive health dashboard.

## What to check

1. **Read phase state** from `.claude/state/phase.json`:
   - Current phase number and name
   - Which phases are completed, in-progress, or not started
   - Health score (if Phase 0 complete)
   - Rescue decision (if Phase 0 complete)
   - Finding counts (if Phase 0 complete)

2. **Count artifacts** in each docs/ directory:
   - docs/audit/ → Phase 0 complete if 7 files exist (00 through 06)
   - docs/triage/ → Phase 1 complete if 2 files exist
   - docs/fix/ → Phase 2 complete if 4 files exist
   - docs/reports/ → Phase 3 complete if 5 files exist
   - docs/ship/ → Phase 4 complete if 6 files exist

3. **Run quick health checks** (using stack profile if available):
   Read docs/audit/00-stack-profile.json for commands, or use defaults:
   - Type check: run typeCheckCommand, count errors
   - Build: run buildCommand, check exit code
   - Tests: run testCommand (if tests exist), report pass/fail count

4. **Check memory** (if exists):
   - docs/memory/rescue-learnings.md — project-specific learnings
   - .claude/memory/rescue/MEMORY.md — cross-project learnings

## Report format

```
=== RESCUE STATUS ===
Phase: [0-4] — [Audit/Triage/Fix/Validate/Ship]
Health Score: [from Phase 0, or "not yet assessed"]
Rescue Decision: [RESCUE/REWRITE/ABANDON, or "pending"]

Findings: X CRITICAL, Y HIGH, Z MEDIUM, W LOW
Build:  PASS/FAIL (X type errors)
Tests:  PASS/FAIL/N/A (X passing, Y failing)

Phase 0 (Audit):    [complete/in-progress/not started] (X/7 reports)
Phase 1 (Triage):   [complete/in-progress/not started] (X/2 docs)
Phase 2 (Fix):      [complete/in-progress/not started] (X/4 reports)
Phase 3 (Validate): [complete/in-progress/not started] (X/5 reports)
Phase 4 (Ship):     [complete/in-progress/not started] (X/6 reports)

Stack: [from stack profile, or "not detected"]
Memory: [X learnings recorded / none]

Next action: [what to do next based on current state]
```
