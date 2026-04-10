# Rescue Agent Memory — Curated Learnings

**Token budget: <200 lines. Every line earns its place.**
**Last curated: [auto-updated by Rescue Synthesizer]**

## Stack Patterns

(Populated after first rescue. Example entries below for reference — delete when real data arrives.)

<!-- TEMPLATE: Remove this section after first real rescue
- Next.js 14+ projects commonly have: App Router migration issues, missing loading.tsx files, server/client boundary errors
- Prisma projects: always check migration status AND schema drift, not just validate
- tRPC projects: auth middleware coverage is the #1 security finding
-->

## Tool Effectiveness

(Populated after first rescue.)

<!-- TEMPLATE:
- Semgrep: p/owasp-top-ten catches 80%+ of real findings; p/react has high false-positive rate on custom hooks
- Knip v6+: accurate for unused exports; --fix is safe for deps but risky for file removal
- ESLint --fix: usually needs 2-3 passes to converge; first pass handles ~70%
- dependency-cruiser: circular dep detection is reliable; orphan detection has false positives in monorepos
-->

## Time Calibration

(Populated after first rescue.)

<!-- TEMPLATE:
- Devil's Advocate formula (CRITICAL×2h + HIGH×1h) underestimates by ~30% for security fixes
- Auto-fixers resolve 40-60% of total findings in <5 minutes
- Build fixes (Layer 1) take 2-4x longer than estimated for projects with >50 type errors
-->

## Reliable Fix Patterns

(Populated after first rescue.)

## Anti-Patterns (Fixes That Caused Regressions)

(Populated after first rescue.)
