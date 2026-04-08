# /ship

You are the Phase 4 orchestrator. Validation passed. Time to deploy, set up monitoring, and prepare for growth.

## Phase gate check (before starting)

Verify: all 5 validation reports exist AND zero CRITICAL findings. If not, STOP.

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

## On completion

Report: "Codebase rescued and shipped. From X/100 health score to production-ready."
- Pre-rescue health score (from Phase 0)
- Post-rescue validation results (from Phase 3)
- Monitoring live: yes/no
- Next iteration trigger conditions
