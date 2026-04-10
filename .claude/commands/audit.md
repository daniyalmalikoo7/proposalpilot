# /audit

You are the Phase 0 orchestrator. The user has pointed you at an existing codebase that needs rescue. Your job is to run 7 audit agents in sequence, each producing a factual report based on actual CLI tool output.

## Phase state initialization

1. Create `docs/audit/` directory if it doesn't exist. Create `docs/audit/screenshots/` for Runtime Auditor.
2. Initialize or update `.claude/state/phase.json`:
   ```
   Set currentPhase: 0
   Set phases.0.status: "in-progress"
   Set phases.0.startedAt: current ISO timestamp
   ```

## Sequence

0. **System Cartographer** (@.claude/agents/phase-0/system-cartographer.md)
   Produce: docs/audit/00-system-map.md + docs/audit/00-stack-profile.json
   Done when: stack detected, features inventoried, integrations mapped, system diagram drawn
   NOTE: This agent runs FIRST. All subsequent agents read its stack profile.

1. **Build Auditor** (@.claude/agents/phase-0/build-auditor.md)
   Produce: docs/audit/01-build-health.md
   Done when: tsc, ESLint, and build all ran with raw output files saved
   Context: reads 00-stack-profile.json for buildCommand/typeCheckCommand/lintCommand

2. **Dependency Auditor** (@.claude/agents/phase-0/dependency-auditor.md)
   Produce: docs/audit/02-dependency-health.md
   Done when: npm audit, npm outdated, and Knip all ran with raw JSON files saved

3. **Security Auditor** (@.claude/agents/phase-0/security-auditor.md)
   Produce: docs/audit/03-security-scan.md
   Done when: Semgrep ran, auth coverage verified route-by-route, IDOR checked
   Context: reads 00-system-map.md for API surface and integration map

4. **Runtime Auditor** (@.claude/agents/phase-0/runtime-auditor.md)
   Produce: docs/audit/04-runtime-health.md
   Done when: dev server started, every route visited, Lighthouse ran, screenshots saved
   Context: reads 00-stack-profile.json for devCommand, port, and routePattern

5. **Architecture Auditor** (@.claude/agents/phase-0/architecture-auditor.md)
   Produce: docs/audit/05-architecture-health.md
   Done when: dependency-cruiser ran, Prisma validated, env vars checked
   Context: reads 00-system-map.md for data model and source directories

6. **Devil's Advocate** (@.claude/agents/phase-0/devils-advocate.md)
   Read ALL 6 reports above (00 through 05), then:
   Produce: docs/audit/06-rescue-decision.md
   Must contain: ## Decision with exactly RESCUE, REWRITE, or ABANDON

## Phase gate check

Before completing, verify:
- [ ] All 7 audit reports exist in docs/audit/ (00 through 06)
- [ ] Stack profile JSON exists (docs/audit/00-stack-profile.json)
- [ ] Raw data files exist (tsc-raw.txt, eslint-raw.json, npm-audit-raw.json, etc.)
- [ ] Rescue decision contains explicit Decision: RESCUE/REWRITE/ABANDON

## Phase state update

On completion, update `.claude/state/phase.json`:
```
Set phases.0.status: "completed"
Set phases.0.completedAt: current ISO timestamp
Set healthScore: [score from Devil's Advocate]
Set rescueDecision: [RESCUE/REWRITE/ABANDON]
Set findingCounts: {critical: X, high: Y, medium: Z, low: W}
```

## On completion

Report:
- Health score from Devil's Advocate (X/100)
- Finding counts: X CRITICAL, Y HIGH, Z MEDIUM, W LOW
- The Decision: RESCUE / REWRITE / ABANDON
- If RESCUE: "Run /triage to classify findings and create the fix plan"
- If REWRITE: "Use claude-workflow-ai-saas /discover instead — this codebase needs a fresh start"
- If ABANDON: explain why the codebase is not worth saving
