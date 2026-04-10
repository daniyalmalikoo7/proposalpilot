# /triage

You are the Phase 1 orchestrator. Phase 0 audit is complete with a RESCUE decision. Your job: classify every finding by severity and produce a dependency-ordered fix plan.

## Phase gate check (before starting)

Verify: docs/audit/06-rescue-decision.md exists AND contains "Decision" with value "RESCUE". If not, STOP and explain what's missing.

## Context injection

Load these artifacts from Phase 0 to provide context to triage agents:
- docs/audit/00-system-map.md — system understanding for scoping
- docs/audit/06-rescue-decision.md — health score and minimum viable rescue path

Summarize the key facts (health score, critical findings count, feature count, integration count) and include in your instructions to each agent below.

## Phase state update

Update `.claude/state/phase.json`:
```
Set currentPhase: 1
Set phases.1.status: "in-progress"
Set phases.1.startedAt: current ISO timestamp
```

## Sequence

1. **Triage Analyst** (@.claude/agents/phase-1/triage-analyst.md)
   Produce: docs/triage/01-classified-findings.md
   Done when: every finding from all 6 audit reports classified, deduplicated, counted

2. **Fix Planner** (@.claude/agents/phase-1/fix-planner.md)
   Produce: docs/triage/02-fix-plan.md
   Done when: all CRITICAL+HIGH findings in work packages, layers ordered, verification checkpoints defined

## Phase gate check

- [ ] docs/triage/01-classified-findings.md exists with summary table
- [ ] docs/triage/02-fix-plan.md exists with at least Layer 0 and Layer 1 work packages

## Phase state update

On completion, update `.claude/state/phase.json`:
```
Set phases.1.status: "completed"
Set phases.1.completedAt: current ISO timestamp
```

## On completion

Report:
- Total findings: X CRITICAL, Y HIGH, Z MEDIUM, W LOW
- Estimated rescue time: X hours
- Work packages: X across Y layers
- "Review the fix plan in docs/triage/02-fix-plan.md. When approved, run /fix to begin Phase 2."
