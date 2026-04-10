# Security Report

## Summary
| Category | Phase 0 | Current | Delta |
|----------|---------|---------|-------|
| SAST Critical | Unknown (scan failed) | 0 | N/A |
| SAST High | Unknown (scan failed) | 0 | N/A |
| SAST Warning | Unknown | 1 (false positive) | N/A |
| SAST Info | Unknown | 2 (false positives) | N/A |
| Unprotected Routes | 0 | 0 | No change |
| IDOR Risks | 0 | 0 | No change |
| Secret Leaks | 0 | 0 | No change |
| Prompt Injection | 1 MEDIUM (H3) | 0 | **-1 (fixed)** |

## Semgrep Comparison
- Phase 0 findings: 0 (but scan was **not authoritative** — rulesets couldn't be fetched)
- Phase 2 re-run: 3 findings (210 rules, authoritative)
- Current (Phase 3 re-run): 3 findings (identical to Phase 2 baseline)
- New findings introduced during rescue: **0**

| # | Severity | Rule | File:Line | Status |
|---|----------|------|-----------|--------|
| 1 | INFO | unsafe-formatstring | `src/app/api/trpc/[trpc]/route.ts:15` | False positive — console.error with tRPC error |
| 2 | INFO | unsafe-formatstring | `src/components/organisms/proposal-editor/index.tsx:51` | False positive — console.error with error object |
| 3 | WARNING | path-join-resolve-traversal | `src/lib/ai/prompts/base.ts:84` | False positive — `promptId` is hardcoded from internal callers, never user input |

**0 CRITICAL, 0 HIGH** — all findings are false positives.

## Auth Coverage
| Route | Auth Method | Phase 0 | Current |
|-------|------------|---------|---------|
| `/api/health` | None (intentionally public) | Public ✅ | Public ✅ |
| `/api/upload` | `auth()` (Clerk userId) | Protected ✅ | Protected ✅ |
| `/api/upload/kb` | `auth()` (Clerk userId + orgId) | Protected ✅ | Protected ✅ |
| `/api/ai/stream-section` | `auth()` (Clerk userId + orgId) | Protected ✅ | Protected ✅ |
| `/api/webhooks/stripe` | Stripe signature verification | Protected ✅ | Protected ✅ |
| `/api/trpc/[trpc]` | Procedure-level (`protectedProcedure` / `orgProtectedProcedure`) | Protected ✅ | Protected ✅ |

**28 tRPC procedure-level guards** across 5 routers (ai: 7, billing: 3, kb: 5, proposal: 8, settings: 5).

## IDOR Verification
| Router | Org-scoping method | Phase 0 | Current |
|--------|-------------------|---------|---------|
| `proposal.*` | `where: { orgId: ctx.internalOrgId }` | OK ✅ | OK ✅ |
| `kb.*` | `where: { orgId: ctx.internalOrgId }` | OK ✅ | OK ✅ |
| `ai.generateSection` | Proposal + KB lookup by `orgId` | OK ✅ | OK ✅ (+ sanitization added) |
| `ai.matchContent` | Requirement via `proposal.orgId` | OK ✅ | OK ✅ |
| `billing.*` | `where: { orgId: ctx.internalOrgId }` | OK ✅ | OK ✅ |
| `settings.*` | `where: { orgId: ctx.internalOrgId }` | OK ✅ | OK ✅ |

## Prompt Injection
| Endpoint | Phase 0 | Current |
|----------|---------|---------|
| `/api/ai/stream-section` | Low (sanitized) | Low (sanitized) ✅ |
| `ai.generateSection` (tRPC) | **MEDIUM** (partial sanitization) | **Low** (full sanitization added in Phase 2) ✅ |

`sanitizeForPrompt` now applied to all user-supplied fields in both AI endpoints. 10 unit tests validate sanitization behavior.

## Secret Scan
- Pattern scan for `sk-*`, `AKIA*`, `ghp_*`, `BEGIN PRIVATE KEY`: **0 matches** in `src/`
- No new secrets committed during rescue (git diff confirms no .env files committed)

## Pre-existing Code Quality Note
6 instances of `as any` exist in `src/app/_components/landing/` for typed route href casts. These are **pre-existing** (not introduced during rescue) and relate to Clerk auth routes not being in the Next.js typed routes manifest. Low risk — no security impact.

## Verdict
**PASS** — Zero CRITICAL findings. Zero HIGH findings. Zero new vulnerabilities introduced. Prompt injection risk downgraded from MEDIUM to LOW. Auth coverage 100%. IDOR protection verified across all routers.
