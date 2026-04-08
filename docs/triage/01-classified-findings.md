# Classified Findings

## Summary
| Severity | Count | Auto-fixable | Requires Judgment |
|----------|-------|-------------|-------------------|
| CRITICAL | 0 | 0 | 0 |
| HIGH | 3 | 0 | 3 |
| MEDIUM | 5 | 0 | 5 |
| LOW | 7 | 2 | 5 |
| **Total** | **15** | **2** | **13** |

---

## CRITICAL Findings
None. The build passes, the app compiles, all routes are protected, zero security vulnerabilities detected.

---

## HIGH Findings

| # | Category | Finding | File(s) | Source Report(s) | Auto-fix? |
|---|----------|---------|---------|-----------------|-----------|
| H1 | TEST | jest.config.ts missing — `npm test` / `npm run test:unit` / `npm run test:coverage` scripts will fail or behave incorrectly because no jest configuration exists to tell Jest how to handle TypeScript, module aliases, and the jsdom environment | — (needs to be created) | 05-architecture-health | No — requires judgment |
| H2 | TEST | Zero unit/integration test files — 0 `.test.ts` / `.test.tsx` files in `src/`. tRPC routers, AI processing pipeline, Prisma queries, and business logic have no automated test coverage. Only 5 E2E tests exist, which require a live server and credentials | — | 05-architecture-health | No — requires judgment |
| H3 | FEATURE | Missing `loading.tsx` for 4 authenticated app routes — Next.js route-level loading boundaries absent for `/dashboard`, `/onboarding`, `/settings`, `/settings/brand-voice`. Users navigating to these routes see no loading skeleton, causing a blank-screen flash or content shift while server-renders complete | `src/app/(app)/dashboard/`, `src/app/(app)/onboarding/`, `src/app/(app)/settings/`, `src/app/(app)/settings/brand-voice/` | 04-runtime-health | No — requires judgment |

**Classification notes:**
- H1 and H2 are both TEST category and tightly coupled — fixing H1 (jest config) is a prerequisite to writing H2 (tests). They are separate findings because H1 is a broken tool and H2 is missing coverage.
- H3 is classified HIGH per the UI/UX standard: "loading states: every data-fetching component gets a skeleton loader" is MANDATORY for any feature touched during rescue. Missing route-level loading = user-visible UX regression.
- `/proposals/[id]` already has inline loading handling in the page component; excluded from H3. `/knowledge-base` and `/proposals` (list) have inline Suspense/skeleton patterns; excluded.

---

## MEDIUM Findings

| # | Category | Finding | File(s) | Source Report(s) | Auto-fix? |
|---|----------|---------|---------|-----------------|-----------|
| M1 | BUILD | `src/middleware.ts` uses deprecated Next.js 15/16 file convention — Next.js 16 renamed `middleware.ts` to `proxy.ts`. Generates `⚠ The "middleware" file convention is deprecated` build warning on every `next build`. Non-breaking today but will become an error in a future Next.js version | `src/middleware.ts` → `src/proxy.ts` | 01-build-health, 04-runtime-health | No — requires judgment (file rename + verify middleware still runs) |
| M2 | ARCHITECTURE | Env validation uses a custom lazy proxy (`src/lib/config.ts`) instead of startup-time Zod validation. Missing vars fail silently until first request that accesses them, rather than failing at process startup. No structured type coercion or human-readable validation errors | `src/lib/config.ts` | 05-architecture-health | No — requires judgment |
| M3 | ARCHITECTURE | Prisma using `db push` workflow (no `prisma/migrations/` directory). Zero migration history means schema changes cannot be rolled back. One erroneous `prisma db push` on production would irreversibly alter the live database with no recovery path | `prisma/schema.prisma` | 05-architecture-health | No — requires judgment (create initial migration baseline) |
| M4 | DEPENDENCY | 14 packages are ≥1 major version behind. Two are 5 majors behind (stripe: 17→22, @types/node: 20→25). Notably: tailwindcss (3→4, breaking rewrite), zod (3→4, breaking rewrite), @clerk/nextjs (6→7), prisma/client (6→7). These are not broken today but represent growing upgrade debt and potential security exposure as older major versions lose support | `package.json` | 02-dependency-health | No — requires judgment (each upgrade needs individual testing) |
| M5 | DEPENDENCY | @anthropic-ai/sdk is 0.36.3 vs 0.85.0 — a gap of ~49 minor versions. While within the same major (0.x), this SDK has undergone significant API changes, streaming model improvements, and new model support in this range. Current version may lack support for newer Gemini/Claude model IDs and streaming patterns | `package.json` | 02-dependency-health | No — requires judgment (test after upgrade) |

---

## LOW Findings

| # | Category | Finding | File(s) | Source Report(s) | Auto-fix? |
|---|----------|---------|---------|-----------------|-----------|
| L1 | STYLE | ESLint 2 errors — `no-console` rule violations in dev script. `console.log()` calls that should be `console.error()` or `console.warn()` | `scripts/test-gemini.ts:37`, `scripts/test-gemini.ts:75` | 01-build-health | **Yes** — `npx eslint --fix scripts/` |
| L2 | BUILD | ESLint using deprecated `.eslintrc` config format. ESLint v9 uses flat config (`eslint.config.js`). Will break when ESLint is upgraded to v10. Generates deprecation warning on every lint run | `.eslintrc.*` (root) | 01-build-health | No — requires judgment (migrate to flat config) |
| L3 | DEPENDENCY | 4 low CVEs in jest-environment-jsdom dependency chain (GHSA-vpq2-c234-7xj6). Test tooling only — not in production bundle. Fix requires major version upgrade of jest-environment-jsdom (29→30) | `package.json` → jest-environment-jsdom | 02-dependency-health | No — `npm audit fix` won't fix (major version bump required) |
| L4 | DEPENDENCY | 4 extraneous packages in node_modules not in package.json: `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@tybys/wasm-util`. Leftover from a removed native module. Not a runtime risk but adds node_modules noise | `node_modules/` (not `package.json`) | 02-dependency-health | **Yes** — `npm prune` |
| L5 | BUILD | Node.js runtime warning at build time: `Warning: --localstorage-file was provided without a valid path`. Non-blocking. Likely from a CLI flag passed during static page generation worker startup | `docs/audit/build-raw.txt` | 01-build-health | No — requires judgment (trace source, likely Next.js internal) |
| L6 | ARCHITECTURE | 12 orphan modules flagged by dependency-cruiser. Likely mostly false positives (depcruise can't trace dynamic imports or Next.js framework-level imports). Confirmed potential dead code: `src/lib/theme.tsx` if CSS tokens have replaced it | Multiple — see 05-architecture-health | 05-architecture-health | No — requires judgment (verify each before removing) |
| L7 | DEPENDENCY | 9 packages behind on minor/patch versions (7 minor, 2 patch). Includes: @tiptap/* (3.21→3.22.3), @tanstack/react-query (5.95→5.96), next (16.2.1→16.2.2 patch), postcss patch. Low risk but small improvements/fixes being missed | `package.json` | 02-dependency-health | No — requires judgment (batch patch/minor upgrades) |

---

## Deduplication Log

The following findings appear in multiple audit reports and are counted ONCE above:

| Finding | Reports | Canonical Entry |
|---------|---------|----------------|
| middleware.ts deprecated build warning | 01-build-health, 04-runtime-health | M1 |
| Missing loading.tsx / loading states | 04-runtime-health, 06-rescue-decision | H3 |
| jest config missing + zero tests | 05-architecture-health, 06-rescue-decision | H1 + H2 |
| @anthropic-ai/sdk behind | 02-dependency-health, 06-rescue-decision | M5 |

---

## Findings by Category

| Category | CRITICAL | HIGH | MEDIUM | LOW | Total |
|----------|----------|------|--------|-----|-------|
| BUILD | 0 | 0 | 1 | 2 | 3 |
| SECURITY | 0 | 0 | 0 | 0 | 0 |
| DEPENDENCY | 0 | 0 | 2 | 3 | 5 |
| FEATURE | 0 | 1 | 0 | 0 | 1 |
| TEST | 0 | 2 | 0 | 0 | 2 |
| ARCHITECTURE | 0 | 0 | 2 | 2 | 4 |
| STYLE | 0 | 0 | 0 | 1 | 1 |
| **Total** | **0** | **3** | **5** | **7** | **15** |
