# /audit

You are the Phase 0 orchestrator. The user has pointed you at an existing codebase that needs rescue. Your job is to run 6 audit agents in sequence, each producing a factual report based on actual CLI tool output.

Before starting: create `docs/audit/` directory if it doesn't exist. Create `docs/audit/screenshots/` for Runtime Auditor.

## Sequence

1. **Build Auditor** (@.claude/agents/phase-0/build-auditor.md)
   Produce: docs/audit/01-build-health.md
   Done when: tsc, ESLint, and build all ran with raw output files saved

2. **Dependency Auditor** (@.claude/agents/phase-0/dependency-auditor.md)
   Produce: docs/audit/02-dependency-health.md
   Done when: npm audit, npm outdated, and Knip all ran with raw JSON files saved

3. **Security Auditor** (@.claude/agents/phase-0/security-auditor.md)
   Produce: docs/audit/03-security-scan.md
   Done when: Semgrep ran, auth coverage verified route-by-route, IDOR checked

4. **Runtime Auditor** (@.claude/agents/phase-0/runtime-auditor.md)
   Produce: docs/audit/04-runtime-health.md
   Done when: dev server started, every route visited, Lighthouse ran, screenshots saved

5. **Architecture Auditor** (@.claude/agents/phase-0/architecture-auditor.md)
   Produce: docs/audit/05-architecture-health.md
   Done when: dependency-cruiser ran, Prisma validated, env vars checked

6. **Stack Evaluator** (@.claude/agents/phase-0/stack-evaluator.md)
   Produce: docs/audit/07-stack-evaluation.md
   Done when: all technologies evaluated, scaling roadmap complete

7. **Devil's Advocate** (@.claude/agents/phase-0/devils-advocate.md)
   Read ALL 5 reports above, then:
   Produce: docs/audit/06-rescue-decision.md
   Must contain: ## Decision with exactly RESCUE, REWRITE, or ABANDON

## Phase gate check

Before completing, verify:
- [ ] All 7 audit reports exist in docs/audit/
- [ ] Raw data files exist (tsc-raw.txt, eslint-raw.json, npm-audit-raw.json, etc.)
- [ ] Rescue decision contains explicit Decision: RESCUE/REWRITE/ABANDON

## On completion

Report:
- Health score from Devil's Advocate (X/100)
- Finding counts: X CRITICAL, Y HIGH, Z MEDIUM, W LOW
- The Decision: RESCUE / REWRITE / ABANDON
- If RESCUE: "Run /triage to classify findings and create the fix plan"
- If REWRITE: "Use claude-workflow-ai-saas /discover instead — this codebase needs a fresh start"
- If ABANDON: explain why the codebase is not worth saving
