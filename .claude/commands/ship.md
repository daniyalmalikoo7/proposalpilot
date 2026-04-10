# /ship

You are the Phase 4 orchestrator. Validation passed. Time to deploy, set up monitoring, generate CI, and produce the final rescue summary.

## Phase gate check (before starting)

Verify: all 5 validation reports exist in docs/reports/ AND zero CRITICAL findings. If not, STOP.

## Context injection

Load these artifacts:
- docs/audit/00-stack-profile.json — for deployment target and tool commands
- docs/audit/00-system-map.md — for integration map (monitoring needs to cover all services)
- docs/audit/06-rescue-decision.md — pre-rescue health score for the delta calculation
- docs/reports/01-05 — validation results for the rescue summary

Summarize: deployment target, integration count, pre-rescue health score, validation results.

## Phase state update

Update `.claude/state/phase.json`:
```
Set currentPhase: 4
Set phases.4.status: "in-progress"
Set phases.4.startedAt: current ISO timestamp
```

## Sequence

1. **Release Manager** (@.claude/agents/phase-4/release-manager.md)
   Produce: docs/ship/01-release-runbook.md
   Done when: staging verified, production deploy plan, rollback procedure documented

2. **Monitoring Engineer** (@.claude/agents/phase-4/monitoring-engineer.md)
   Produce: docs/ship/02-monitoring-setup.md
   Done when: error tracking configured, health checks live, alerts defined

3. **Cost Engineer** (@.claude/agents/phase-4/cost-engineer.md)
   Produce: docs/ship/03-cost-analysis.md
   Done when: per-service costs estimated, budget alerts configured, scaling projections done

4. **Growth Analyst** (@.claude/agents/phase-4/growth-analyst.md)
   Produce: docs/ship/04-growth-plan.md
   Done when: analytics configured, KPIs defined, feedback collection in place

5. **CI Generator** (@.claude/agents/phase-4/ci-generator.md)
   Produce: docs/ship/05-ci-config.md + .github/workflows/quality-gate.yml
   Done when: CI workflow generated matching stack profile, all rescue tools represented

6. **Rescue Synthesizer** (@.claude/agents/phase-4/rescue-synthesizer.md)
   Produce: docs/ship/06-rescue-summary.md + docs/memory/rescue-learnings.md
   Done when: health score delta calculated, all findings accounted for, learnings distilled

## Phase state update

On completion, update `.claude/state/phase.json`:
```
Set phases.4.status: "completed"
Set phases.4.completedAt: current ISO timestamp
```

## On completion

Report: "Codebase rescued and shipped. From X/100 health score to production-ready."
- Pre-rescue health score (from Phase 0)
- Post-rescue validation results (from Phase 3)
- Monitoring live: yes/no
- CI configured: yes/no
- Rescue summary: docs/ship/06-rescue-summary.md
- Next iteration trigger conditions
