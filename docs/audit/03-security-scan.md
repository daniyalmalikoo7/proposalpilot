# Security Audit

## Summary
- SAST findings: 0 critical, 0 high, 0 medium, 0 low (**Semgrep could not fetch rulesets due to network/proxy restrictions; results are not authoritative**)
- Secrets detected: 0 findings (pattern scan over repo + `src/`)
- Auth coverage: 5/6 API routes protected (1 intentionally public), tRPC procedures appear protected by `protectedProcedure` / `orgProtectedProcedure`
- IDOR risk: 0 confirmed endpoints without ownership checks (sampling across API + tRPC shows consistent org scoping); 1 endpoint is user-scoped only (`/api/upload`)
- Prompt injection: 2 AI entrypoints assessed (`/api/ai/stream-section`, `ai.generateSection`); 1 has strong sanitization/validation, 1 has weaker prompt-boundary handling

## SAST Findings (Semgrep)
Semgrep execution produced `docs/audit/semgrep-raw.json`, but the scan could not download the `auto` / pack configs because outbound access to `semgrep.dev` was blocked by proxy restrictions (403).

As a result:
- Counts in `semgrep-raw.json` are **0 findings**, but should be treated as **unknown** until Semgrep can run with network access (or with vendored rules).

## Secret Leaks
No matches found for common token/key patterns (sampled):
- `sk-...` (OpenAI-style)
- `AKIA...` (AWS)
- `ghp_...` (GitHub)
- `BEGIN * PRIVATE KEY`
- simple `password="..."` patterns under `src/`

## Authentication Coverage
### API Routes (filesystem enumerated)
| Route | Auth Method | Status |
|---|---|---|
| `/api/health` | None (public health check) | **Public (intentional)** |
| `/api/upload` | `auth()` (Clerk) requires `userId` | **Protected** |
| `/api/upload/kb` | `auth()` (Clerk) requires `userId` + `orgId` | **Protected** |
| `/api/ai/stream-section` | `auth()` (Clerk) requires `userId` + `orgId` | **Protected** |
| `/api/trpc/[trpc]` | tRPC context via Clerk `auth()` | **Protected by procedure-level guards** |
| `/api/webhooks/stripe` | Stripe signature verification (`STRIPE_WEBHOOK_SECRET`) | **Protected (signature)** |

### tRPC Procedures
Observed router usage:
- `orgProtectedProcedure` for org-scoped reads/writes (proposal/kb/ai/billing/settings)
- `protectedProcedure` for settings `getOrg` to allow pre-provision flows
- No observed use of `publicProcedure` in `src/server/routers/*`

## IDOR Assessment
Sampling indicates org ownership checks are consistently applied:
- `proposal.get/list/*` query by `orgId: ctx.internalOrgId`
- `kb.list/search/delete` query by `orgId: ctx.internalOrgId`
- `/api/ai/stream-section` verifies `proposalId` belongs to internal org before any KB fetch or generation

Potential weak spot to track:
- `/api/upload` is authenticated by `userId` only (no org check). It currently looks like an extraction utility that returns chunks without DB writes, but it still processes untrusted file input and should remain rate-limited and authenticated (it is).

## AI/Prompt Injection Assessment
| Endpoint | User Input in Prompt | Input Sanitized | Output Validated | Risk Level |
|---|---|---|---|---|
| `/api/ai/stream-section` | section title, requirements, instructions, KB item content, brand voice | **Yes** (`renderPrompt` sanitizes variables; explicit `sanitizeForPrompt` on KB/brand voice); guard checks | **Yes** (`SectionGeneratorOutputSchema`) | Low |
| `ai.generateSection` (tRPC) | section title, requirements, instructions, KB item content, brand voice | **Partial/unclear** (prompt variables built without explicit per-field sanitization in this router) | **Yes** (`SectionGeneratorOutputSchema`) | Medium |

## Raw Data
- Semgrep: `docs/audit/semgrep-raw.json` (stderr: `docs/audit/semgrep-stderr.txt`)

# Security Audit

## Summary
- SAST findings: 0 critical, 0 high, 0 medium, 0 low (Semgrep — 103 rules, 226 files)
- Secrets detected: 0 findings (manual scan; gitleaks not installed)
- Auth coverage: 5/5 API routes protected (0 unprotected)
- IDOR risk: 0 endpoints without ownership checks
- Prompt injection: 1 AI endpoint assessed, MITIGATED (sanitizeForPrompt + system/user separation)

## SAST Findings (Semgrep)

Semgrep ran with configs: p/react, p/nextjs, p/typescript, p/owasp-top-ten.
Result: **0 findings** across 226 files, 103 rules.

### Critical (0)
None.

### High (0)
None.

## Secret Leaks
No secret leaks found.
- Gitleaks not installed — manual scan performed
- `grep` for common patterns (sk-, AKIA, ghp_, password=) across src/ found 0 matches
- All secrets go through `src/lib/config.ts` env proxy — never hardcoded
- `.env` file is gitignored (standard Next.js setup)

Note: Secret keys (CLERK_SECRET_KEY, GOOGLE_GEMINI_API_KEY, STRIPE_SECRET_KEY, VOYAGE_API_KEY) are accessed server-side only via `env` proxy in `src/lib/config.ts`. Not exposed to client.

## Authentication Coverage

### Protected Routes (5/5)
| Route/Procedure | Auth Method |
|----------------|-------------|
| POST /api/ai/stream-section | Clerk `auth()` — userId + orgId required |
| /api/trpc/[trpc] | tRPC context reads Clerk `auth()` on every request; `protectedProcedure` and `orgProtectedProcedure` enforce auth |
| POST /api/upload/kb | Clerk `auth()` — userId + orgId required |
| POST /api/upload | Clerk `auth()` — userId required |
| POST /api/webhooks/stripe | Stripe webhook signature verification via `stripe.webhooks.constructEvent()` (STRIPE_WEBHOOK_SECRET) |

### UNPROTECTED Routes — CRITICAL (0)
None found.

### tRPC Procedures
- `publicProcedure`: exported from trpc.ts but not used in any router (only has timing middleware, no auth bypass)
- `protectedProcedure`: requires userId in context (from Clerk auth)
- `orgProtectedProcedure`: requires userId + orgId — used for all data operations
- All 3 tRPC routers (proposal.ts, kb.ts, ai.ts, settings.ts) use `protectedProcedure` or `orgProtectedProcedure`

## IDOR Assessment
| Endpoint | Accepts ID | Filters by Tenant | Status |
|---------|-----------|-----------------|--------|
| proposal.getById | proposalId | `where: { id, orgId: ctx.internalOrgId }` | SAFE |
| proposal.update | proposalId | `where: { id, orgId: ctx.internalOrgId }` | SAFE |
| proposal.delete | proposalId | `where: { id, orgId: ctx.internalOrgId }` | SAFE |
| kb.getById | kbItemId | `where: { id, orgId: ctx.internalOrgId }` | SAFE |
| ai.generateSection | proposalId | `where: { id: proposalId, orgId: ctx.internalOrgId }` | SAFE |
| /api/ai/stream-section | proposalId | Prisma query scoped to orgId from auth | SAFE |
| settings.get | — | `where: { clerkOrgId: ctx.orgId }` | SAFE |

All endpoints that accept user-supplied IDs filter by `orgId` from the auth context. No IDOR vulnerabilities found.

## AI/Prompt Injection Assessment
| Endpoint | User Input in Prompt | Input Sanitized | Output Validated | Risk Level |
|---------|---------------------|----------------|-----------------|-----------|
| POST /api/ai/stream-section | sectionTitle, requirements, instructions, KB content, brandVoice | `sanitizeForPrompt()` applied to all user content | Zod schema (`SectionGeneratorOutputSchema`) + hallucination guard (`runGuards()`) | LOW |

`sanitizeForPrompt()` in `src/lib/ai/prompts/base.ts:116` strips `<s>`, `</s>`, `<user>`, `</user>` tags and `{{` template syntax, and enforces 10,000 char hard cap. System/user message separation is the primary control (defence in depth).

Output is validated via `SectionGeneratorOutputSchema` (Zod) before rendering to client.

## Environment Variable Assessment
- All server secrets go through `src/lib/config.ts` env proxy
- No `process.env.SECRET_KEY` patterns found directly in route handlers
- Client-side code (`src/lib/trpc/provider.tsx`) only references `VERCEL_URL`, `PORT`, and `NODE_ENV` — no secrets
- `NEXT_PUBLIC_*` vars not observed being used for sensitive values

## Raw Data
- Semgrep: docs/audit/semgrep-raw.json
- Gitleaks: not installed (manual scan performed)
