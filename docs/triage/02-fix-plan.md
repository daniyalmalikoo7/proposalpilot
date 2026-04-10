# Fix Plan

## Total Estimate
- Minimum viable rescue (Layers 0–4): ~8.5 hours
- Full rescue (including Layer 5): ~11 hours
- Devil's Advocate estimate: ~11.25 hours (buffered)
- Variance: within 1.3x — acceptable

## Layer 0: Auto-Fixes
**Time:** ~15 min | **Verify:** `npm run build`

| Step | Command | Expected Result | Finding(s) |
|------|---------|-----------------|------------|
| 0.1 | `npx prettier --write .` | Formatting normalized | — |
| 0.2 | `ESLINT_USE_FLAT_CONFIG=false npx eslint src/ --fix` | Auto-fixable lint issues resolved | H1 (partial) |
| 0.3 | `npm prune` | 4 extraneous packages removed | L2 |
| 0.4 | `npm update` | Minor/patch-behind packages updated | L4 |

**Commit:** `fix(auto): deterministic fixes — prettier, eslint --fix, npm prune, npm update`

## Layer 1: Build Fixes
**Time:** ~1 hour | **Verify:** `npx tsc --noEmit && npm run build`

| WP# | Finding(s) | Files | What to Fix | Verify |
|-----|-----------|-------|-------------|--------|
| 1.1 | H1 | `.eslintrc.json` or `.eslintignore` | Add `playwright-report/**` to ESLint `ignorePatterns` so generated trace files don't pollute lint results. | `ESLINT_USE_FLAT_CONFIG=false npx eslint src/ --format json 2>&1 \| node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.reduce((a,f)=>a+f.errorCount,0),'errors')"` |
| 1.2 | M4 | `package.json`, `postcss.config.js`, `jest.config.js` | Resolve unlisted/unresolved packages: add `postcss-load-config` and `dotenv` to `devDependencies` (they're used by PostCSS config and Playwright); fix or remove `babel-jest` reference in Jest config. | `npx knip --reporter json 2>&1 \| node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('unlisted:',d.unlisted?.length??0,'unresolved:',d.unresolved?.length??0)"` |

**Commit per WP:** `fix(build): exclude playwright-report from eslint scope`, `fix(build): resolve unlisted and unresolved packages`

## Layer 2: Security Fixes
**Time:** ~2 hours | **Verify:** re-run Semgrep (with network or vendored rules), review auth coverage

| WP# | Finding(s) | Files | What to Fix | Verify |
|-----|-----------|-------|-------------|--------|
| 2.1 | H3 | `src/server/routers/ai.ts` | Add explicit `sanitizeForPrompt` call on all user-supplied fields (`title`, `requirements`, `instructions`, `kbContent`, `brandVoice`) before they're interpolated into the prompt template, matching the pattern already used in `/api/ai/stream-section`. | Manual review + grep for `sanitizeForPrompt` usage consistency |
| 2.2 | H2 | CI/tooling | Re-run Semgrep with vendored rules or in an environment with unrestricted network access to `semgrep.dev`. Produce authoritative SAST baseline. | `semgrep scan --config auto --json` produces findings file |

**Commit per WP:** `fix(security): sanitize prompt inputs in ai.generateSection`, `chore(security): re-run semgrep with authoritative ruleset`

## Layer 3: Feature Fixes
**Time:** ~2.5 hours | **Verify:** `npm run dev` + curl every page route returns 200

| WP# | Finding(s) | Files | What to Fix | Verify |
|-----|-----------|-------|-------------|--------|
| 3.1 | C1 | Next.js config, middleware, `.env` | Diagnose and fix dev server runtime instability. The repeated "Failed to proxy localhost:3000" / ECONNRESET pattern suggests: (a) missing/invalid env vars causing Clerk middleware to error on every request, (b) a proxy/rewrite loop, or (c) a port conflict. Steps: verify `.env` has all required Clerk keys, start dev server, check for middleware errors, isolate whether it's a Clerk auth redirect loop or a network-level issue. | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` returns `200` (or `302` for auth-required routes) |

**Commit:** `fix(runtime): resolve dev server proxy loop / ECONNRESET`

**NOTE:** WP 3.1 (C1) is the highest-priority work package in the entire rescue. It blocks all runtime verification, Lighthouse testing, and meaningful E2E testing. It should be attempted first within Layer 3, and if it takes >4 hours, the rescue should be reassessed per the Devil's Advocate conditions.

## Layer 4: Test Creation
**Time:** ~2.5 hours | **Verify:** `npx playwright test` + `npx jest`

| WP# | Feature/Path | Test File | Assertions | Finding(s) |
|-----|-------------|-----------|------------|------------|
| 4.1 | Health check (`/api/health`) | `tests/api/health.spec.ts` | Returns 200, valid JSON body | M6 |
| 4.2 | Landing page (`/`) | `tests/e2e/landing.spec.ts` | Page loads, key elements visible, no console errors | M6 |
| 4.3 | Auth flow (`/sign-in` → `/dashboard`) | `tests/e2e/auth-flow.spec.ts` | Clerk sign-in renders, protected routes redirect unauthenticated users | M6 |
| 4.4 | Proposal CRUD (`/proposals`) | `tests/e2e/proposals.spec.ts` | List loads, create proposal works, editor opens | M6 |
| 4.5 | Knowledge base (`/knowledge-base`) | `tests/e2e/kb.spec.ts` | KB page loads, upload form visible | M6 |
| 4.6 | tRPC router unit tests | `tests/unit/routers/*.test.ts` | Input validation, auth guards, org scoping for proposal/kb/ai routers | M6 |

**Commit per WP:** `test(e2e): add smoke tests for [feature]`, `test(unit): add tRPC router tests`

## Layer 5: Polish (post-MVP backlog)
These are MEDIUM and LOW findings deferred from the minimum viable rescue. Tracked for completeness.

| # | Finding | Category | Severity | Effort |
|---|---------|----------|----------|--------|
| M1 | 7 unused production deps | DEPENDENCY | MEDIUM | 15 min |
| M2 | 4 unused devDeps | DEPENDENCY | MEDIUM | 10 min |
| M3 | 14 major-behind packages | DEPENDENCY | MEDIUM | 2–4 hours (per-package evaluation) |
| M5 | 16 unused exports | DEPENDENCY | MEDIUM | 20 min (knip --fix) |
| M7 | 7 unused files | DEPENDENCY | MEDIUM | 15 min (review + delete) |
| L1 | 4 low CVEs in test deps | DEPENDENCY | LOW | 30 min (major bump jest-environment-jsdom) |
| L3 | ESLint flat config migration | BUILD | LOW | 1–2 hours |
| L5 | Zod env validation upgrade | ARCHITECTURE | LOW | 1 hour |

## Verification Checkpoints
| After | Command | Must Pass |
|-------|---------|-----------|
| Layer 0 | `npm run build` | Exit code 0 |
| Layer 1 | `npx tsc --noEmit && ESLINT_USE_FLAT_CONFIG=false npx eslint src/ --format json` | 0 TS errors, 0 src ESLint errors |
| Layer 2 | `semgrep scan --config auto --json` (with network) | 0 CRITICAL findings |
| Layer 3 | `npm run dev` + `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` | Dev server stable, pages return 200/302 |
| Layer 4 | `npx playwright test && npx jest` | All tests green |

## Dependency Graph (execution order)
```
Layer 0 (auto-fixes)
  └→ Layer 1 (build fixes)
       ├→ Layer 2 (security fixes)  ← can start after Layer 1
       └→ Layer 3 (feature fixes)   ← can start after Layer 1
            └→ Layer 4 (test creation) ← requires Layer 3 (runtime must work)
                 └→ Layer 5 (polish)   ← post-MVP backlog
```

Note: Layers 2 and 3 can run in parallel after Layer 1 completes, since security fixes (prompt sanitization) and runtime fixes (dev server) touch different files. Layer 4 depends on Layer 3 because E2E tests require a working dev server.
