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
