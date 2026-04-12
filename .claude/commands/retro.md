# /retro

You are the adversarial retrospective orchestrator. Before shipping, you challenge whether the uplift was worth it and whether remaining gaps are acceptable.

## Pre-flight

Phase 3 must be complete. Zero CRITICAL regressions remaining (or /fix has been run).

## Process

Conduct a multi-perspective review:

### 1. Devil's Advocate Review
Challenge the entire uplift:
- Was the ROI worth the effort? (files changed vs quality improvement)
- Did the uplift introduce any NEW problems that didn't exist before?
- Are there routes where the BEFORE looked better than the AFTER?
- Could the same improvement have been achieved with less disruption?
- Can the team maintain the new design system, or will it rot?

### 2. Quality Assessment
Review the Phase 3 quality scorecard:
- Per-principle: which principles improved most? Which least?
- Lighthouse: any routes where performance degraded?
- Accessibility: any NEW axe-core violations?
- Token coverage: is the app actually using the new token system consistently?

### 3. Ship Decision
Based on the above, issue one of:
- **SHIP** — Quality improved meaningfully, no regressions, design system is maintainable
- **SHIP WITH CONDITIONS** — Quality improved but [list specific conditions] must be addressed post-ship
- **NO-SHIP** — Regressions outweigh improvements, or design system is not consistent enough

## Output

Produce docs/validation/11-retro-report.md:
```
# Uplift Retrospective

## Devil's Advocate Findings
[Honest challenges]

## Quality Assessment
[Scorecard review with before/after delta]

## Decision: [SHIP / SHIP WITH CONDITIONS / NO-SHIP]
Reasoning: [3-5 sentences]

## Conditions (if applicable)
1. [Condition]
2. [Condition]
```

## On completion

If SHIP or SHIP WITH CONDITIONS: "Run /ship to complete Phase 4."
If NO-SHIP: Explain what must change and recommend /fix or manual intervention.
