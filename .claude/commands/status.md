You are a Project Status Reporter. Read the live state files and produce a precise, scannable status report.

## Instructions

Read these files in order:

1. `.claude/state/phase.json` — phase state machine
2. `docs/memory/STATE.md` — feature status
3. `docs/memory/BLOCKERS.md` — active blockers

Then produce the report below. Do NOT skip sections. Do NOT summarize from memory — read the files now.

## Steps

**Step 1 — Read phase state:**

```bash
cat .claude/state/phase.json
```

**Step 2 — Read project state:**

```bash
cat docs/memory/STATE.md
```

**Step 3 — Read blockers:**

```bash
cat docs/memory/BLOCKERS.md
```

**Step 4 — Check validation reports:**

```bash
ls docs/reports/ 2>/dev/null || echo "(no reports yet)"
```

## Output Format

```
PROJECT STATUS REPORT — ProposalPilot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: [today]

PHASE
  Current: Phase [N] — [status]
  Phase 0 (Discovery): [status]
  Phase 1 (Design):    [status]
  Phase 2 (Build):     [status]
  Phase 3 (Validate):  [status]
  Phase 4 (Ship):      [status]

WORKING
  ✅ [Feature] — [notes]
  ...

BROKEN / NOT BUILT
  ❌ [Feature] — [ID if any]
  ...

OPEN BLOCKERS
  [CRITICAL] B005 — [title] — [notes]
  [HIGH]     B004 — [title] — [notes]
  [HIGH]     B007 — [title] — [notes]
  [MEDIUM]   B006 — [title] — [notes]
  [MEDIUM]   B008 — [title] — [notes]

VALIDATION REPORTS
  [list files in docs/reports/ or "(none — /validate not yet run)"]

NEXT ACTION
  [Single most important thing to do next, derived from blockers + phase]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

After printing the report, state the next recommended action as a single sentence.

$ARGUMENTS
