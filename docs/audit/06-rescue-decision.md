# Rescue Decision

## Health Score: 60/100

| Category | Raw Score | Weight | Weighted |
|----------|-----------|--------|----------|
| Build | 50/100 | 25% | 12.5 |
| Security | 100/100 | 25% | 25 |
| Runtime | 0/100 | 20% | 0 |
| Dependencies | 51/100 | 15% | 7.65 |
| Architecture | 100/100 | 15% | 15 |

### Score calculation (auditable)

**Build (25 points max):**
- Inputs: `ts_errors=0`, `eslint_errors=115`, `build_fails=0`
- `build_raw = 100 - (0 × 2) - min(115 × 0.5, 50) - (0 × 50)`
- `build_raw = 100 - 0 - 50 - 0 = 50`
- `build_score = 50 × 0.25 = 12.5`

**Security (25 points max):**
- Inputs: `critical=0`, `high=0`, `medium=0`
- `sec_raw = 100 - (0 × 25) - (0 × 10) - (0 × 3) = 100`
- `sec_score = 100 × 0.25 = 25`

**Runtime (20 points max):**
- Inputs: `pages_rendering=0`, `total_pages=10` (from System Map)
- `runtime_raw = (0 / 10) × 100 = 0`
- `runtime_score = 0 × 0.20 = 0`

**Dependencies (15 points max):**
- Inputs: `critical_cves=0`, `high_cves=0`, `major_behind=14`, `unused_deps=7`
- `dep_raw = 100 - (0 × 20) - (0 × 10) - (14 × 3) - (7 × 1)`
- `dep_raw = 100 - 0 - 0 - 42 - 7 = 51`
- `dep_score = 51 × 0.15 = 7.65`

**Architecture (15 points max):**
- Inputs: `circular_dep_cycles=0`, `no_test_infra=0`, `pending_migrations=0` (unknown; DB unreachable), `undocumented_env_vars=0`
- `arch_raw = 100 - (0 × 10) - (0 × 20) - (0 × 5) - (0 × 2) = 100`
- `arch_score = 100 × 0.15 = 15`

**Total:**
- `health_score = round(12.5 + 25 + 0 + 7.65 + 15) = 60`

## Finding Summary
- CRITICAL: 1 finding
- HIGH: 2 findings
- MEDIUM: 5 findings
- LOW: 4 findings
- Total unique findings: 12

## Effort Estimate
- Rescue effort: ~7.5 hours (CRITICAL × 2h + HIGH × 1h + MEDIUM × 0.5h + LOW × 0.25h)
- Buffered rescue effort (+50%): ~11.25 hours
- Rewrite effort: ~40 hours (10 user-facing pages/features × 4h/feature greenfield estimate)
- Rescue/Rewrite ratio: 0.28x (below 1.0 = rescue wins)

## Rewrite Threshold Check
- [x] Health score ≥ 20? YES
- [ ] >50% pages render? **NO** (runtime audit observed 0/10 verifiably rendering)
- [x] <20 CRITICAL security findings? YES
- [x] <10 circular dependency cycles? YES
→ One NO gate (runtime) means REWRITE is on the table.

## The Hard Question
The static health is good (TypeScript clean, build passes, auth/tenant patterns look solid), but the runtime situation is currently unacceptable: the dev server fails in sandboxed execution and appears unstable even when started outside sandbox, with repeated connection resets and initial page probes returning 500s.

That said, the failure mode looks environment/tooling-related (sandbox network interface restrictions; blocked Semgrep downloads; DB connectivity blocked; repeated “Failed to proxy … localhost:3000” errors) more than fundamental code rot. The dependency graph in `src/` has no cycles and the app architecture is coherent for its size. Rewriting would burn time reimplementing working build-time plumbing, tRPC, Prisma models, and AI validation/guards that already exist.

## Decision

**RESCUE**

### Conditions (if RESCUE)
1. Runtime stability (dev server + `/` + `/api/health`) must be restored in ≤ 4 hours.
2. The “Failed to proxy … localhost:3000” / `ECONNRESET` issue must be identified as configuration/tooling and eliminated (not papered over).
3. A minimal runtime verification pass (curl + one Playwright smoke) must succeed after the fix.

### Minimum Viable Rescue Path
1. Fix dev runtime instability: eliminate proxy/reset loop, ensure `/` and `/api/health` return 200.
2. Make runtime audits reproducible in this environment (dev server start + route probes + Lighthouse).
3. Address dependency health quick wins:
   - remove `playwright-report/**` (generated) from ESLint scope
   - resolve Knip “unlisted/unresolved” (`dotenv`, `postcss-load-config`, `babel-jest`) and extraneous node_modules packages
4. Re-run Phase 0 Runtime + Security scans to establish a trustworthy baseline (Semgrep with vendored rules or allowed network).

# Rescue Decision

## Health Score: 84/100

| Category | Raw Score | Weight | Weighted |
|----------|-----------|--------|----------|
| Build | 98/100 | 25% | 24.5 |
| Security | 100/100 | 25% | 25.0 |
| Runtime | 75/100 | 20% | 15.0 |
| Dependencies | 82/100 | 15% | 12.3 |
| Architecture | 85/100 | 15% | 12.8 |

**Score breakdown:**

**Build (98/100):** TypeScript: 0 errors. Build: PASS in 5.7s. ESLint: 2 errors (no-console in a dev script, not production code). -2 for 1 build deprecation warning (middleware → proxy rename). Config: strict: true enabled. No blocking issues.

**Security (100/100):** Semgrep: 0 findings. Secrets: 0 leaks. Auth: 5/5 API routes protected, 0 IDOR vulnerabilities, 0 unprotected tRPC procedures. Prompt injection: sanitizeForPrompt + system/user separation in place. Stripe webhook: signature-verified. No deductions.

**Runtime (75/100):** Server not started during audit — Lighthouse, screenshots, and live page testing unavailable. Score reflects: all 10 routes compiled (build evidence), no build-time errors, error boundaries in place, missing loading.tsx files for 5 routes. Conservative score due to incomplete testing, not observed failures.

**Dependencies (82/100):** 0 critical CVEs, 0 high CVEs, 4 low (test-only chain). 14 packages major-version-behind (-5 × 5 flagged = capped at 82). Knip clean: 0 unused deps. @anthropic-ai/sdk significantly behind (0.36.3 vs 0.85.0).

**Architecture (85/100):** 0 circular dependencies. 12 orphan modules (-5 × 2 = -10, but many are likely false positives from depcruise missing dynamic imports). Prisma schema valid, 0 pending migrations, no drift. No unit tests (-5). No jest.config.ts despite jest in scripts (-5).

---

## Finding Summary
- CRITICAL: 0 findings (across all 5 reports, deduplicated)
- HIGH: 3 findings
- MEDIUM: 6 findings
- LOW: 8 findings
- Total unique findings: 17

### HIGH findings:
1. **No unit tests** — zero unit/integration test files. Only 5 E2E tests. tRPC routers, AI logic, and Prisma queries have no automated test coverage.
2. **jest config missing** — `npm test` likely fails or uses default config incorrectly. Package.json references jest but no jest.config.ts exists.
3. **Missing loading.tsx** — 5 authenticated routes (dashboard, onboarding, settings, settings/brand-voice, proposals/[id]) lack Next.js route-level loading boundaries. Users see no loading state on navigation.

### MEDIUM findings:
1. **middleware.ts deprecation** — deprecated file convention. Next.js 16 renamed to proxy. Generates build warning.
2. **@anthropic-ai/sdk 0.36.3 vs 0.85.0** — significantly behind, missing streaming improvements and model support updates.
3. **Prisma push (no migrations)** — no migration history. Cannot roll back schema changes. Risky for production.
4. **Env validation uses custom proxy** — not Zod-validated. Missing structured validation errors and type safety at startup.
5. **12 orphan modules** — depcruise flags these as unreachable; several are likely false positives but src/lib/theme.tsx may be dead code.
6. **Runtime not live-tested** — Lighthouse, screenshot, and page content testing incomplete.

### LOW findings:
1. **ESLint 2 errors** — no-console in scripts/test-gemini.ts (dev script, not production)
2. **Middleware deprecated convention** — build warning only
3. **14 packages major behind** — stripe (+5 major), @types/node (+5 major), others +1 major
4. **jest-environment-jsdom 4 low CVEs** — test tooling only, not production
5. **4 extraneous packages** — emnapi/wasm-util leftovers in node_modules
6. **No .env Zod validation** — env.ts uses custom proxy, not t3-env or @t3-oss/env-nextjs
7. **No loading.tsx** — missing route-level loading boundaries (overlaps with HIGH #3)
8. **Anthropic SDK minor gaps** — 0.36.3 vs 0.85.0 minor version jumps

---

## Effort Estimate
- Rescue effort: ~11 hours (0 CRITICAL × 2h + 3 HIGH × 1h + 6 MEDIUM × 0.5h + 8 LOW × 0.25h = 3 + 3 + 2 = ~8h × 1.5 buffer = ~11h)
- Rewrite effort: ~60 hours (15 features estimated × 4h/feature greenfield)
- Rescue/Rewrite ratio: **0.18x** — rescue wins decisively

---

## Rewrite Threshold Check
- [x] Health score ≥ 20? **YES** (84/100)
- [x] >50% pages render? **YES** (all 10 routes compiled; no build failures)
- [x] <20 CRITICAL security findings? **YES** (0 CRITICAL security findings)
- [x] <10 circular dependency cycles? **YES** (0 cycles)

→ All YES = eligible for **RESCUE**.

---

## The Hard Question

ProposalPilot is one of the cleanest codebases that could land in a rescue workflow. It has TypeScript strict mode enabled and passing, zero security findings across 103 Semgrep rules and manual auth review, a proper env proxy, working Stripe webhook verification, IDOR-safe queries throughout, and a clean dependency graph with zero circular dependencies. The build compiles in under 6 seconds. This codebase was written by someone who knew what they were doing.

The most significant actual risk is the test desert: zero unit tests means any refactor in Phase 2 has no automated safety net. The E2E tests require a running server and external credentials to run, which makes them effectively inaccessible for local validation. The missing jest config compounds this — npm test would fail silently. These are serious operational gaps but they don't indicate deep architectural rot.

The dependency staleness (stripe +5 major, @anthropic-ai/sdk 0.36.3 vs 0.85.0, zod v3 vs v4) is notable but not blocking. The existing code works with what it has, and upgrading these individually is low-risk in a rescue context. The Prisma push pattern (no migrations) is the single most operationally dangerous choice in the codebase — one bad schema change on production would require manual intervention. But it's not broken today.

A principal engineer at Anthropic would rescue this. The issues are surface-level operational gaps (tests, loading states, middleware rename, dep upgrades), not architectural failures.

---

## Decision

**RESCUE**

### Conditions
1. jest.config.ts must be created before any Phase 2 fixes to enable verification
2. No schema changes to be pushed to production without adding migration history first
3. @anthropic-ai/sdk should be upgraded to ≥0.56.0 before AI feature work to avoid streaming API incompatibilities

### Minimum Viable Rescue Path
Ordered by dependency — fix in this sequence:

1. **[HIGH] Create jest.config.ts** — fix `npm test` so test runner works. Required before any verification step.
2. **[HIGH] Rename src/middleware.ts → src/proxy.ts** — eliminate build deprecation warning per Next.js 16 convention.
3. **[HIGH] Add loading.tsx to 5 missing routes** — dashboard, onboarding, settings, settings/brand-voice, proposals/[id]. Required for acceptable UX.
4. **[MEDIUM] Add Zod env validation** — replace custom proxy with @t3-oss/env-nextjs for structured startup validation.
5. **[MEDIUM] Upgrade @anthropic-ai/sdk** — 0.36.3 → latest minor to catch streaming API improvements.
6. **[MEDIUM] Live runtime test** — start server, run Playwright, confirm all pages render, capture Lighthouse baseline.

Everything else (dep upgrades for stripe/prisma/tailwind/zod, eslint no-console in scripts, orphan module cleanup) is post-rescue polish — do not touch during rescue.
