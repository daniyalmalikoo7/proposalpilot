# Fix Plan

## Total Estimate
- Minimum viable rescue (Layers 0–4): ~8 hours
- Full rescue (including Layer 5): ~11 hours
- Devil's Advocate estimate: ~11 hours
- Delta: within range (L5 polish deferred accounts for difference)

---

## Layer 0: Auto-Fixes
**Time:** ~10 min | **Findings:** L1, L4
**Verify:** `npm run lint && npm run build`

| Step | Command | Expected Result |
|------|---------|-----------------|
| 0.1 | `npx eslint --fix scripts/` | Removes 2 `no-console` errors in scripts/test-gemini.ts |
| 0.2 | `npm prune` | Removes 4 extraneous packages (@emnapi/*, @tybys/wasm-util) from node_modules |

**Findings resolved:** L1, L4
**Commit after:** `fix(auto): remove no-console lint errors and extraneous node_modules`

---

## Layer 1: Build Fixes
**Time:** ~30 min | **Findings:** M1
**Verify:** `npm run build` — zero deprecation warnings

| WP# | Finding(s) | Files | What to Fix | Verify |
|-----|-----------|-------|-------------|--------|
| 1.1 | M1 | `src/middleware.ts` → `src/proxy.ts` | Rename `src/middleware.ts` to `src/proxy.ts` per Next.js 16 convention. The file content stays identical — only the filename changes. Next.js 16 automatically picks up `src/proxy.ts` as the middleware/proxy file. Verify the Clerk `clerkMiddleware` still applies to protected routes after rename. | `npm run build` — no `⚠ middleware file convention is deprecated` warning |

**Commit after:** `fix(build): rename middleware.ts to proxy.ts for Next.js 16 convention`

---

## Layer 2: Security Fixes
**Time:** 0 — No security findings to fix
**Verify:** `semgrep scan --config p/owasp-top-ten --json` — zero findings

No CRITICAL or HIGH security findings were found in Phase 0. Layer 2 is a no-op for this codebase.

Verification checkpoint still required: re-run Semgrep to confirm no regressions from Layer 0–1 changes.

---

## Layer 3: Feature Fixes
**Time:** ~2 hours | **Findings:** H3
**Verify:** Start dev server, navigate to each route, confirm skeleton loader appears before data loads

| WP# | Finding(s) | Files | What to Fix | Verify |
|-----|-----------|-------|-------------|--------|
| 3.1 | H3 | `src/app/(app)/dashboard/loading.tsx` (create) | Create a `loading.tsx` file that renders a skeleton layout matching the dashboard page structure: header skeleton, stat card skeletons (3–4 cards), content area skeleton. Use existing design tokens (`bg-muted`, `animate-pulse`, `rounded-md`, etc.) consistent with patterns in `knowledge-base/page.tsx` and `proposals/page.tsx`. | Navigate to `/dashboard` — skeleton visible before hydration completes |
| 3.2 | H3 | `src/app/(app)/onboarding/loading.tsx` (create) | Create a `loading.tsx` with a centered card skeleton matching the onboarding step layout: title skeleton, description skeleton, input/button area skeleton. | Navigate to `/onboarding` — no blank flash |
| 3.3 | H3 | `src/app/(app)/settings/loading.tsx` (create) | Create a `loading.tsx` with a settings page skeleton: section header skeleton, form field skeletons. This loading file covers both `/settings` and `/settings/brand-voice` since `brand-voice` is a child segment — a separate `brand-voice/loading.tsx` is only needed if the sub-route needs different treatment. Add `src/app/(app)/settings/brand-voice/loading.tsx` as well to be explicit. | Navigate to `/settings` and `/settings/brand-voice` — no blank flash |

**Commit after each WP:** one commit per loading.tsx file (3 commits total):
- `fix(ux): add loading skeleton for /dashboard`
- `fix(ux): add loading skeleton for /onboarding`
- `fix(ux): add loading skeletons for /settings and /settings/brand-voice`

---

## Layer 4: Test Creation
**Time:** ~4 hours | **Findings:** H1, H2
**Verify:** `npm test` exits 0 with test results

### Step 4.0 — Create jest.config.ts (H1 prerequisite)

| WP# | Finding(s) | Files | What to Fix | Verify |
|-----|-----------|-------|-------------|--------|
| 4.0 | H1 | `jest.config.ts` (create), `jest.setup.ts` (create) | Create `jest.config.ts` at project root that configures: `testEnvironment: 'node'` for server-side tests, `moduleNameMapper` for `@/*` path aliases matching tsconfig paths, `transform` using `ts-jest` or `babel-jest` with Next.js babel config, `setupFilesAfterFramework: ['./jest.setup.ts']`. Create minimal `jest.setup.ts` that imports `@testing-library/jest-dom`. Target: `src/**/*.test.ts`. | `npm test` runs without config error; `npx jest --listTests` shows test files |

**Commit:** `fix(test): add jest.config.ts and jest.setup.ts`

### Step 4.1 — Write unit tests (H2)

Priority order: test the highest-risk server-side logic first.

| WP# | Finding(s) | Test File | What to Test | Assertions |
|-----|-----------|-----------|-------------|------------|
| 4.1 | H2 | `src/server/routers/proposal.test.ts` | tRPC proposal router — create, list, update, delete procedures. Mock `ctx.db` with in-memory stub. Mock `ctx.internalOrgId`. | create returns a new proposal with correct orgId scoping; getById with wrong orgId returns null; delete is org-scoped |
| 4.2 | H2 | `src/server/routers/kb.test.ts` | tRPC kb router — create KB item, get by id, delete. Focus on org-scoping. Mock db. | getById with correct orgId returns item; getById with different orgId returns not-found error |
| 4.3 | H2 | `src/lib/ai/prompts/base.test.ts` | `sanitizeForPrompt()` function — the prompt injection defence. Also test `renderPrompt()` variable substitution and missing-variable detection. | strips `<s>`, `<user>` tags; breaks `{{` template syntax; enforces 10k char limit; renderPrompt throws on missing variable |
| 4.4 | H2 | `src/lib/middleware/rate-limit.test.ts` | `checkRateLimit()` function — sliding window logic. | allows requests under limit; throws on exceeding limit; resets after window |

**Commit after each WP:** one commit per test file.

---

## Layer 5: Polish (post-MVP backlog)
**Time:** ~3 hours | **Findings:** M2, M3, M4, M5, L2, L3, L5, L6, L7

These are deferred — do NOT fix during the minimum viable rescue.

| # | Finding | Effort | Notes |
|---|---------|--------|-------|
| M2 | Env validation (custom proxy → Zod via @t3-oss/env-nextjs) | ~1h | Migrate `src/lib/config.ts` to t3-env. Low risk of breakage but touches env access across all routes. |
| M3 | Prisma migrations baseline | ~30min | Run `npx prisma migrate dev --name init` to create baseline migration from current schema. No schema changes needed. |
| M4 | 14 major-version-behind deps | ~2h | Upgrade one at a time, in this order: (1) next + eslint-config-next (patch to 16.2.2), (2) @types/node, (3) @clerk/nextjs 6→7 (check Clerk changelog), (4) lucide-react 0→1. Defer stripe 17→22, prisma 6→7, tailwind 3→4, zod 3→4 (these are large breaking upgrades). |
| M5 | @anthropic-ai/sdk 0.36.3→0.85.0 | ~1h | Upgrade and verify AI streaming endpoint still works. Check for API breaking changes in changelog. |
| L2 | ESLint .eslintrc → flat config | ~30min | Migrate to `eslint.config.js`. Required before ESLint v10. |
| L3 | jest-environment-jsdom CVEs | ~15min | Upgrade jest + jest-environment-jsdom to v30. Only needed once tests exist. |
| L5 | --localstorage-file Node.js warning | ~15min | Trace source (Next.js 16 internal). Likely resolves with next patch upgrade. |
| L6 | 12 orphan modules | ~30min | Review each; remove confirmed dead code (likely `src/lib/theme.tsx`). |
| L7 | 9 minor/patch packages behind | ~15min | Batch upgrade: `npx npm-check-updates -u --target minor && npm install` |

---

## Verification Checkpoints

| After | Command | Must Pass |
|-------|---------|-----------|
| Layer 0 | `npm run build && npm run lint` | Exit code 0, zero lint errors |
| Layer 1 | `npm run build` | Zero deprecation warnings for middleware |
| Layer 2 | `semgrep scan --config p/owasp-top-ten --json docs/audit/semgrep-raw.json` | Zero CRITICAL findings |
| Layer 3 | Start dev server, navigate to `/dashboard`, `/onboarding`, `/settings`, `/settings/brand-voice` | Skeleton loader visible on each route before content appears |
| Layer 4 | `npm test` | All tests pass, zero failures |

---

## Dependency Order Summary

```
Layer 0 (auto-fixes)
  ↓ [build must pass]
Layer 1 (build: middleware rename)
  ↓ [build clean, no warnings]
Layer 2 (security: no-op, but verify)
  ↓ [zero security regressions]
Layer 3 (feature: loading.tsx files)
  ↓ [UX verified manually]
Layer 4 (tests: jest config first, then unit tests)
  H1 (jest.config.ts) → must exist before H2 (write tests)
  ↓ [all tests pass]
Layer 5 (polish: deferred)
```

**File conflict check:** No file is touched in more than one work package within a layer. Layer 1 touches only `src/middleware.ts` → `src/proxy.ts`. Layer 3 creates 4 new files in separate directories. Layer 4 creates 5 new files (jest.config.ts, jest.setup.ts, 3 test files).
