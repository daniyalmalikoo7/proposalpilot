# Architecture Health Audit

## Summary
- Circular dependencies: 0 cycles (within `src/**`; dependency-cruiser includes cycles in `node_modules`, ignored)
- Orphan modules: 68 files (heuristic; includes Next.js route files/components that appear as entrypoints)
- Prisma schema: valid ✅
- Pending migrations: unable to check ⚠️ (DB unreachable from this environment; `P1001`)
- Schema drift: unable to check ⚠️ (requires DB access)
- Test infrastructure: Jest ✅ + Playwright ✅
- Test files: 9 (coverage ratio: 9 test files / ~99 source files)
- Env vars: 11 referenced (via `src/lib/config.ts` + limited direct `process.env`), 11 documented, 0 undocumented

## Circular Dependencies
Dependency-cruiser was run without a custom config (`--no-config`) and reported **0 circular dependencies within `src/`**.

Note: the raw output includes circularities in `node_modules/` (e.g., `mammoth`, `jszip`, `readable-stream`), which are external and not actionable here.

## Orphan Modules
Orphan detection is heuristic without a project-specific depcruise config. The reported orphans include many Next.js entrypoints (App Router pages/routes) which are expected to have no inbound imports.

Examples (sample):
- `src/app/(app)/dashboard/page.tsx`
- `src/app/api/health/route.ts`
- `src/components/atoms/button.tsx`

## Database Health
- Prisma validate: ✅ schema is valid (`docs/audit/prisma-validate-raw.txt`)
- Prisma migrate status: ⚠️ failed to reach DB (`P1001`) (`docs/audit/prisma-migrate-raw.txt`)
- Schema drift: ⚠️ not checked (requires `DATABASE_URL` connectivity)

## File Organization
Top-level `src/` directory file counts:
| Directory | Files | Pattern |
|---|---:|---|
| `src/app` | 36 | Next.js App Router (route groups + API routes) |
| `src/lib` | 31 | Shared services/utilities (AI, DB, middleware) |
| `src/components` | 23 | Component library (atoms/molecules/organisms/templates) |
| `src/server` | 9 | tRPC router + server plumbing |

Assessment: generally consistent App Router + service-layer split; no single directory exceeds ~36 files.

## Environment Configuration
- `.env.example`: exists ✅
- Env validation: exists ✅ (`src/lib/config.ts` as centralized env accessor with runtime-required enforcement)
- Undocumented env vars: none found (all referenced keys are present in `.env.example`)
- Potentially sensitive vars in client code: expected `NEXT_PUBLIC_*` usage (documented in `.env.example`)

## Test Infrastructure
- Unit test runner: Jest (`jest.config.js`)
- E2E test runner: Playwright (`playwright.config.ts`)
- Test files: 9 total

## Raw Data
- dependency-cruiser: `docs/audit/depcruise-raw.json` (stderr: `docs/audit/depcruise-stderr.txt`)
- Prisma validate: `docs/audit/prisma-validate-raw.txt`
- Prisma migrate: `docs/audit/prisma-migrate-raw.txt`

# Architecture Health Audit

## Summary
- Circular dependencies: 0 cycles (in src/ — node_modules excluded)
- Orphan modules: 12 files (not reachable from dependency graph entry points)
- Prisma schema: valid ✅
- Pending migrations: 0 (schema is up to date with database)
- Schema drift: none detected (Database schema is up to date!)
- Test infrastructure: jest (package.json script, no config file) + playwright (playwright.config.ts exists)
- Test files: 0 unit tests, 5 E2E tests
- Env vars: 2 referenced via process.env in src/, all others via `env` proxy — .env.example well-documented

## Circular Dependencies
**0 cycles detected in src/.**

dependency-cruiser ran on 139 source modules — no circular dependency cycles found.

## Orphan Modules
12 modules not reachable from any detected entry point:
```
src/components/organisms/proposal-editor/types.ts
src/lib/ai/providers/types.ts
src/lib/ai/validators/brand-voice-output.ts
src/lib/ai/validators/requirement-extractor-output.ts
src/lib/ai/validators/section-generator-input.ts
src/lib/ai/validators/section-generator-output.ts
src/lib/db.ts
src/lib/theme.tsx
src/lib/types/proposal.ts
src/lib/utils.ts
src/lib/utils/html-parser.ts
src/middleware.ts
```

Notes:
- `src/lib/db.ts` and `src/lib/utils.ts` are foundational — likely used but depcruise doesn't find entry point to trace them
- `src/middleware.ts` is special Next.js file (not imported by anything, executed by framework)
- Validator files may be used dynamically — depcruise may miss dynamic imports
- `src/lib/theme.tsx` — potential dead code if theme is handled via CSS tokens instead

## Database Health
- **Schema validation:** PASSED ✅
  ```
  The schema at prisma/schema.prisma is valid 🚀
  ```
- **Migration status:** "No migration found in prisma/migrations" — using Prisma `push` workflow (schema-first, no migrations directory)
  - `Database schema is up to date!` — no drift between schema.prisma and live database
- **Schema drift:** None detected ✅
- **Note:** Using Prisma push (no migrations folder) vs migrate dev — acceptable for early-stage SaaS but loses migration history. Risk: cannot roll back schema changes.
- **Database:** PostgreSQL via Supabase connection pooling (aws-1-ap-northeast-2.pooler.supabase.com)
- **Prisma upgrade available:** 6.19.2 → 7.7.0 (major — see dependency health report)

## File Organization
| Directory | Files | Pattern |
|-----------|-------|---------|
| src/app | 30 | Next.js App Router — route groups (app), (auth) |
| src/lib | 29 | Utility/service layer — ai/, config, db, types, middleware |
| src/components | 23 | UI components — organisms, UI primitives |
| src/server | 7 | tRPC routers and context |

**Assessment:** Consistent Next.js App Router pattern. Feature-based route groups: `(app)` for authenticated pages, `(auth)` for Clerk auth pages. No directories with >20 files. Organization is clean and logical.

No deviations from pattern noted. Well-structured for a SaaS of this size.

## Environment Configuration
- `.env.example`: exists ✅ — comprehensive, with comments and all required vars
- Env validation (Zod/envalid): custom proxy in `src/lib/config.ts` — NOT Zod-validated ⚠️
  - Uses lazy `requireEnv()` / `optionalEnv()` helper — fails at runtime on first access if missing, not at startup
  - Pattern is functional but weaker than Zod — no type coercion, no structured validation error messages
- `process.env` used directly only for: `NODE_ENV`, `LOG_LEVEL`, `DATABASE_URL`, `PORT`, `VERCEL_URL` (3 in lib, 2 in client provider)
- Undocumented vars referenced in code but present in .env.example:
  - `DATABASE_URL` — documented ✅
  - `NODE_ENV` — standard, documented ✅
  - `LOG_LEVEL` — documented ✅
  - `PORT` — standard, not in .env.example (acceptable)
  - `VERCEL_URL` — standard Vercel var, not in .env.example (acceptable)
- Potentially sensitive vars in client code: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — in .env.example as a NEXT_PUBLIC_ var (intentionally public)
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL/SIGN_UP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — all appropriate NEXT_PUBLIC_ vars

## Test Infrastructure
- **Unit test runner:** jest — referenced in package.json scripts (`test`, `test:unit`, `test:coverage`) but no jest.config.ts/js file exists. Jest config missing — `npm test` likely fails.
- **E2E test runner:** playwright — `playwright.config.ts` exists ✅
- **Unit test files:** 0 (zero `.test.ts` / `.test.tsx` / `.spec.ts` files in src/)
- **E2E test files:** 5 (in tests/e2e/: generation-flow, knowledge-base, navigation, proposal-editor, proposals-list)
- **Coverage estimate:** 0/30 feature files have corresponding unit tests (0%). E2E tests cover 5 user flows.

**Critical gap:** No unit or integration tests for server-side logic (tRPC routers, AI processing, Prisma queries). Only E2E coverage exists.

## Raw Data
- dependency-cruiser: docs/audit/depcruise-raw.json
- Prisma validate: docs/audit/prisma-validate-raw.txt
- Prisma migrate: docs/audit/prisma-migrate-raw.txt
