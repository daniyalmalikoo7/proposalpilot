# ProposalPilot — Phase 3 Quality Audit

_Date: 2026-04-03 | Branch: validate/quality-audit | Auditor: Claude Code (Sonnet 4.6)_

**Methodology**: Measure everything, fix nothing. All findings are reported as-is.

---

## Section 1 — Build Verification

**Result: FAIL**

### Steps taken

1. `node_modules` was absent — ran `npm install --legacy-peer-deps` before build.
2. `npm run build` (resolves to `next build`) executed.

### Output

```
▲ Next.js 16.2.1 (Turbopack)
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
✓ Compiled successfully in 4.9s
✓ TypeScript check passed in 5.1s
✗ Export error on /(app)/settings/brand-voice/page → prerender failure
⨯ Next.js build worker exited with code: 1
```

**Total elapsed**: ~13.6s before failure exit.

### Error detail

```
Error: @clerk/clerk-react: Missing publishableKey.
  at /settings/brand-voice (prerender step)
```

The build fails during static page generation (`getStaticProps` / RSC prerender), not during
compilation or type-checking. The `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` env var is not present
in the build environment, causing Clerk to throw during prerender of `/settings/brand-voice`.

### Warnings

| Warning                                                                   | Severity |
| ------------------------------------------------------------------------- | -------- |
| `middleware` file convention is deprecated; replace with `proxy`          | LOW      |
| No ESLint config found — `npm run lint` errors with "no eslint.config.js" | HIGH     |
| 7 npm audit vulnerabilities (4 low, 3 high — see Section 5)               | HIGH     |

### TypeScript

`npx tsc --noEmit` exits **clean** (no output, exit 0). TypeScript is fully passing.

---

## Section 2 — Performance Measurement

### tRPC timing middleware

**Status: PRESENT** — already implemented in `src/server/trpc.ts:46-56`.

```ts
const timingMiddleware = t.middleware(async (opts) => {
  const start = performance.now();
  const result = await opts.next();
  const durationMs = Math.round(performance.now() - start);
  logger.info(`[PERF] ${opts.path}: ${durationMs}ms`, { ... });
  return result;
});
```

Applied to all procedures via `publicProcedure = t.procedure.use(timingMiddleware)`. ✓

### Live timing measurements

**Result: UNABLE TO MEASURE** — build fails and the database is not accessible
from this audit environment (DATABASE_URL is unconfigured). The dev server cannot
serve authenticated tRPC queries without a live Supabase connection.

The table below shows the budget targets. All procedures must be re-measured against
a running Supabase instance before deployment.

| Procedure                            | Budget P95 | Measured P95 | Status  |
| ------------------------------------ | ---------- | ------------ | ------- |
| `proposal.list`                      | <200ms     | N/M          | UNKNOWN |
| `proposal.get` (full relations)      | <300ms     | N/M          | UNKNOWN |
| `kb.list`                            | <200ms     | N/M          | UNKNOWN |
| `kb.search` ("healthcare migration") | <500ms     | N/M          | UNKNOWN |

**N/M = Not Measurable in this environment.**

### Structural concerns identified (static analysis)

| Procedure                 | Concern                                                                                                                                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `proposal.get`            | `include: { rfpSource, requirements, sections, complianceMatrix, winLoss }` — fetches all 5 relations in one query. No field selection (`select`) on relations — returns full rows including `content: Text` on sections. At scale this will be slow. |
| `kb.search` (vector path) | Embeds query via Voyage AI (external HTTP) + pgvector cosine scan. Combined latency will exceed 500ms P95 budget without an IVFFlat index on `KbChunk.embedding` (see Section 3).                                                                     |
| `ai.extractRequirements`  | Calls Clerk API + DB inside the mutation — not a performance concern per the AI budget, but Clerk SDK call adds ~100-300ms.                                                                                                                           |

---

## Section 3 — Database Audit

### Indexes in schema.prisma

| Model                 | @@index / @unique                                      | Covers                                      |
| --------------------- | ------------------------------------------------------ | ------------------------------------------- |
| Organization          | `@@index([clerkOrgId])` + `@unique clerkOrgId`         | Redundant (unique implies index) — harmless |
| User                  | `@@index([orgId])`                                     | FK + list queries ✓                         |
| Proposal              | `@@index([orgId, status])`, `@@index([userId])`        | List + FK ✓                                 |
| ExtractedRequirement  | `@@index([proposalId])`                                | FK ✓                                        |
| ProposalSection       | `@@index([proposalId, order])`                         | Ordered section fetch ✓                     |
| KnowledgeBaseItem     | `@@index([orgId, type])`, `@@index([orgId, isActive])` | List + type filter ✓                        |
| KbChunk               | `@@index([itemId])`                                    | FK only                                     |
| ProcessedWebhookEvent | `@@index([stripeEventId])` + `@unique`                 | Redundant — harmless                        |

### Missing indexes (FLAGS)

| Column                        | Used in                                             | Budget rule                                                      | Severity                                                      |
| ----------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| `KbChunk.embedding`           | pgvector cosine scan in `searchSimilar`             | "pgvector: IVFFlat index on embedding columns (not brute force)" | **CRITICAL** — brute force O(n) scan is unacceptable at scale |
| `Proposal.updatedAt`          | `orderBy: { updatedAt: "desc" }` in `proposal.list` | "Every WHERE clause column has an @@index"                       | MEDIUM — Postgres can still use seq scan; slow at >10k rows   |
| `KnowledgeBaseItem.updatedAt` | `orderBy: { updatedAt: "desc" }` in `kb.list`       | Same                                                             | MEDIUM                                                        |

### DATABASE_URL port

`.env.example` has empty values for both `DATABASE_URL` and `DIRECT_URL`. Cannot
verify the actual port used in production. **Required**:

- `DATABASE_URL` → port **6543** (PgBouncer pooled, required by Prisma Client at runtime)
- `DIRECT_URL` → port **5432** (direct connection, required by Prisma Migrate)

The schema correctly uses both `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")`.
Port correctness must be verified against the actual deployed Supabase connection strings.

### pgvector comment mismatch

`KbChunk.embedding` is declared as `vector(1024)` (Voyage AI voyage-3 dimensions).
The schema comment still says `// pgvector — 1024 dims (Voyage AI voyage-large-2)` —
`voyage-large-2` is deprecated and was already replaced with `voyage-3` (B001 fix).
Comment is stale.

---

## Section 4 — Error Handling Audit

### tRPC procedure coverage

| Procedure                     | try-catch | Typed TRPCError       | Notes                                                                                            |
| ----------------------------- | --------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| `proposal.create`             | ✗         | Partial               | No try-catch around `clerkClient()` or `db.user.upsert` — Clerk/DB errors surface as untyped 500 |
| `proposal.list`               | ✗         | N/A                   | DB error → untyped 500                                                                           |
| `proposal.get`                | ✗         | ✓ NOT_FOUND           | `findFirst` throws on DB error; NOT_FOUND is handled                                             |
| `proposal.createSection`      | ✗         | ✓ NOT_FOUND           | Same pattern                                                                                     |
| `proposal.updateSection`      | ✗         | ✓ NOT_FOUND           | Same pattern                                                                                     |
| `proposal.export`             | ✗         | ✓ NOT_FOUND           | `exportProposal` errors unhandled                                                                |
| `proposal.setOutcome`         | ✗         | ✓ NOT_FOUND           | `$transaction` errors unhandled                                                                  |
| `kb.create`                   | ✗         | N/A                   | `embedAndStoreChunks` failure is caught ✓ (non-fatal `.catch`)                                   |
| `kb.list`                     | ✗         | N/A                   | DB error → untyped 500                                                                           |
| `kb.search`                   | ✓         | Partial               | Catches embed+search failure, falls back to full-text ✓                                          |
| `kb.delete`                   | ✗         | ✓ NOT_FOUND           | OK                                                                                               |
| `ai.extractRequirements`      | ✗         | ✓ NOT_FOUND           | `executeWithFallback` has internal retry, but no outer catch                                     |
| `ai.matchContent`             | ✗         | ✓ NOT_FOUND           | Voyage embed failure → untyped 500                                                               |
| `ai.generateSection`          | ✗         | ✓ NOT_FOUND           | `executeWithFallback` has internal retry                                                         |
| `ai.analyzeBrandVoice`        | ✗         | N/A                   | Service error → untyped 500                                                                      |
| `ai.checkCompliance`          | ✗         | ✓ NOT_FOUND           | Body is TODO stub returning zeros                                                                |
| `billing.createCheckout`      | ✗         | ✓ NOT_FOUND           | Stripe API errors → untyped 500                                                                  |
| `billing.createPortalSession` | ✗         | ✓ PRECONDITION_FAILED | Stripe API errors → untyped 500                                                                  |
| `settings.getOrg`             | ✗         | N/A                   | DB error → untyped 500                                                                           |
| `settings.updateOrg`          | ✗         | N/A                   | DB error → untyped 500                                                                           |

**Summary**: 17/20 procedures lack try-catch. Only `kb.search` has a meaningful fallback.
Unhandled DB and external API errors will surface as generic tRPC INTERNAL_SERVER_ERROR
with no client-usable error code.

### Error boundary tests (static analysis, no live server)

| Test                                  | Expected                                     | Assessed                                        |
| ------------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| `proposal.get` with fake CUID         | `TRPCError NOT_FOUND`                        | ✓ — `findFirst` returns null → NOT_FOUND thrown |
| `kb.search` with empty string         | Zod validation failure — `z.string().min(1)` | ✓ — input rejected before handler runs          |
| `kb.search` with Voyage embed failure | Falls back to full-text ILIKE search         | ✓ — try-catch + fallback present                |

---

## Section 5 — Security Scan

### Secret / key exposure

Command: `grep -r "GEMINI|VOYAGE|STRIPE|SECRET" --include="*.ts" --include="*.tsx" src/ | grep -v "process.env" | grep -v "env." | grep -v "//"`

**Findings**: No hardcoded secrets. All hits are:

1. **`src/lib/config.ts`** — TypeScript interface field declarations and switch-case
   string literals used to index `process.env`. These are key _names_, not key _values_.
2. **`src/server/routers/billing.ts`** — `"STRIPE_PRICE_STARTER" as const` etc. are
   enum-style identifiers for config lookup, not raw secrets.
3. **`src/lib/services/embeddings.ts`** — string literal in an error message
   `"VOYAGE_API_KEY is not set"`. Not a value.

**Result: No secrets in source. PASS.**

### Auth gating

| Route                         | Auth mechanism                                    | Gated?        |
| ----------------------------- | ------------------------------------------------- | ------------- |
| All tRPC procedures           | `orgProtectedProcedure` → Clerk JWT + org lookup  | ✓             |
| `settings.getOrg`             | `protectedProcedure` (auth only, no org required) | ✓ intentional |
| `POST /api/ai/stream-section` | `auth()` from `@clerk/nextjs/server`              | ✓             |
| `POST /api/upload/kb`         | `auth()` from `@clerk/nextjs/server`              | ✓             |
| `POST /api/upload`            | Not audited in this pass                          | UNKNOWN       |
| `POST /api/webhooks/stripe`   | Not audited in this pass                          | UNKNOWN       |

**IDOR prevention**: `orgProtectedProcedure` derives `internalOrgId` exclusively from
the Clerk session JWT. Client-supplied org IDs are never trusted (comment SEC-003
confirmed present in all AI router procedures). ✓

### RFP content sanitization

`stream-section/route.ts` calls `sanitizeForPrompt()` on `brandVoice.tone`,
`item.title`, and `item.content` before injecting into the prompt template.
`requirementsText` is built by joining the `requirements` array with numeric prefixes;
`sanitizeForPrompt` is **not** applied to individual requirement strings.

**Potential gap**: If `input.requirements` contains prompt-injection payloads (e.g.
`"Ignore previous instructions..."`), they are injected unsanitized into the
section-generator prompt. The Zod schema caps each requirement at the array level
(`max(50)`) but does not sanitize string content.

### console.log violations (CLAUDE.md: "NEVER use console.log")

| File                                                 | Lines                                  | Severity                            |
| ---------------------------------------------------- | -------------------------------------- | ----------------------------------- |
| `src/server/routers/ai.ts`                           | 31, 48                                 | HIGH — production server code       |
| `src/app/api/ai/stream-section/route.ts`             | 96                                     | HIGH — production server code       |
| `src/lib/ai/fallback-chain.ts`                       | 101, 113, 120, 130, 146, 158, 169, 175 | HIGH — 8 violations in core AI path |
| `src/app/(app)/error.tsx`                            | 16                                     | MEDIUM — client error boundary      |
| `src/app/(app)/proposals/[id]/error.tsx`             | 16                                     | MEDIUM — client error boundary      |
| `src/app/api/trpc/[trpc]/route.ts`                   | 14                                     | HIGH — tRPC route handler           |
| `src/components/organisms/proposal-editor/index.tsx` | 50                                     | MEDIUM — client component           |

**Note**: `src/lib/logger.ts` itself wraps console internally — that is acceptable.
All other files above are policy violations.

### npm audit

```
7 vulnerabilities (4 low, 3 high)

HIGH: effect <3.20.0 — AsyncLocalStorage context contamination under concurrent load
  └─ @prisma/config 6.13.0–6.19.2 depends on vulnerable effect
  └─ prisma depends on @prisma/config

HIGH (4x low): @tootallnate/once <3.0.1 — Incorrect Control Flow Scoping
  └─ jsdom → jest-environment-jsdom chain (test tooling only, not production)
```

**Production risk**: The `effect`/`@prisma/config`/`prisma` chain affects the
production Prisma client. Concurrent requests could experience AsyncLocalStorage
context contamination. Fix: `npm audit fix` upgrades `effect` to ≥3.20.0.

### ESLint — MISSING CONFIG

`npm run lint` (→ `next lint`) fails with:

```
Invalid project directory provided, no such directory: .../lint
```

No `eslint.config.js`, `.eslintrc.json`, or `.eslintrc.js` exists. Linting is
**entirely unenforced** — the `console.log` violations and potentially other
code-quality issues have never been caught by CI.

---

## Section 6 — Bundle Analysis

**Caveat**: The build failed during prerendering (Section 1). The `.next/static/chunks/`
directory contains output from the Turbopack compilation phase only — page-level chunks
and route-specific splits are absent. This is a **partial bundle**; the full production
bundle will be larger.

### Partial chunk inventory (31 files, from compilation phase)

| Chunk              | Uncompressed  | Gzipped       | Budget target | Status                    |
| ------------------ | ------------- | ------------- | ------------- | ------------------------- |
| `0-kja7tuflb2d.js` | 484 KB        | **146 KB**    | <150 KB       | YELLOW (2.7% under limit) |
| `00nvzi6qb_-1r.js` | 224 KB        | 69 KB         | <150 KB       | PASS                      |
| `03~yq9q893hmn.js` | 112 KB        | 39 KB         | <150 KB       | PASS                      |
| `0bu--cci7w4sz.js` | 108 KB        | 29 KB         | <150 KB       | PASS                      |
| `08.271z_g4flz.js` | 100 KB        | 27 KB         | <150 KB       | PASS                      |
| Remaining 26 files | ~572 KB total | ~156 KB total | —             | PASS                      |

**Total partial bundle**: 1.6 MB uncompressed / ~466 KB gzipped.

The largest chunk at **146 KB gzipped** is within the 150 KB target but at 97% of
the limit. Once page-level splits are added (editor, KB panel, Tiptap, etc.), this
chunk or a page chunk is likely to exceed the 150 KB target.

**Likely offenders in the largest chunk** (needs `@next/bundle-analyzer` to confirm):

- Tiptap editor extensions
- shadcn/ui component tree
- superjson transformer (bundled into client)

---

## Summary — Findings by Severity

### CRITICAL (blocks deployment)

| ID  | Finding                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------- |
| C1  | Build fails — missing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in build env                                    |
| C2  | No IVFFlat index on `KbChunk.embedding` — pgvector does brute-force O(n) scan                             |
| C3  | Prisma `effect` vulnerability (concurrent AsyncLocalStorage contamination) in production dependency chain |

### HIGH

| ID  | Finding                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------- |
| H1  | No ESLint config — linting entirely unenforced                                                          |
| H2  | 8 `console.log` violations in `fallback-chain.ts` (core AI path)                                        |
| H3  | 3 `console.log` violations in server/API handlers (`ai.ts`, `stream-section/route.ts`, `trpc/route.ts`) |
| H4  | 17/20 tRPC procedures lack try-catch — Stripe and Clerk errors surface as untyped 500s                  |
| H5  | `proposal.get` fetches all 5 relations with full `content: Text` — unbounded response at scale          |
| H6  | `api.checkCompliance` is a stub returning zeros (TODO comment) — not a real implementation              |

### MEDIUM

| ID  | Finding                                                                                         |
| --- | ----------------------------------------------------------------------------------------------- |
| M1  | `Proposal.updatedAt` and `KnowledgeBaseItem.updatedAt` missing indexes on `orderBy` columns     |
| M2  | `input.requirements` strings not sanitized before prompt injection in `stream-section`          |
| M3  | `src/middleware.ts` deprecated convention — should be `proxy` (Next.js 16 warning)              |
| M4  | `KbChunk` schema comment still references `voyage-large-2` (deprecated, fixed in B001)          |
| M5  | Largest JS chunk at 146 KB gzipped — 97% of 150 KB target with incomplete build                 |
| M6  | `DATABASE_URL` / `DIRECT_URL` ports unverifiable — must confirm 6543 (pooled) and 5432 (direct) |
| M7  | `console.log` in client error boundaries (`error.tsx`, `proposal-editor`)                       |

### LOW

| ID  | Finding                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------ |
| L1  | Redundant `@@index` + `@unique` on `Organization.clerkOrgId` and `ProcessedWebhookEvent.stripeEventId` |
| L2  | Live P95 tRPC timing measurements unavailable — cannot validate against performance budget             |
| L3  | `npm audit`: 4 low-severity `@tootallnate/once` CVEs in test tooling (`jest-environment-jsdom`)        |

---

_Report generated: 2026-04-03. Do not fix in this branch — audit only._
