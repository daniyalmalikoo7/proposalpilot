# Security Report

## Summary
| Category | Phase 0 | Current | Delta |
|----------|---------|---------|-------|
| SAST Critical | 0 | 0 | 0 |
| SAST High | 0 | 0 | 0 |
| SAST Warning | 0 | 1 (WARNING severity) | +1 (pre-existing, not from rescue) |
| SAST Info | 0 | 2 (INFO severity) | +2 (pre-existing, not from rescue) |
| Unprotected Routes | 0 | 0 | 0 |
| IDOR Risks | 0 | 0 | 0 |
| Secret Leaks | 0 | 0 | 0 |
| `any` types from rescue | 0 | 0 | 0 |

## Semgrep Comparison
- Phase 0 findings: 0 (103 rules, 226 files — ran without `--config auto`)
- Current findings: 3 (254 rules, 256 files — ran with `--config auto` added)
- Resolved: 0 (nothing was broken)
- New from rescue changes: 0
- **Delta explained:** 3 findings appeared because this run included `--config auto` in addition to the original p/ configs. All 3 findings are in PRE-RESCUE code, not in any rescue commit. They were not detected in Phase 0 because `--config auto` was not included.

### Finding Details (3 total — all pre-rescue, not critical)
| Severity | Rule | File:Line | Assessment |
|----------|------|-----------|------------|
| INFO | `unsafe-formatstring` | `src/app/api/trpc/[trpc]/route.ts:15` | False positive — `console.error('tRPC error on ' + path, error.message)` in dev-only error handler. Not a format string injection vulnerability. |
| INFO | `unsafe-formatstring` | `src/components/organisms/proposal-editor/index.tsx:51` | False positive — template literal string concatenation. Not a `printf`-style format string. |
| WARNING | `path-join-resolve-traversal` | `src/lib/ai/prompts/base.ts:84` | `path.join(PROMPTS_DIR, promptId + '.v' + version + '.md')` — `promptId` is a hardcoded constant in all callers (`"section-generator"`), NEVER user-supplied. No traversal risk in practice. |

**Verdict on new findings: all 3 are false positives.** The path-join finding would be a real risk if `promptId` came from user input — but inspection of all call sites confirms it's always a hardcoded string literal (`loadPrompt("section-generator")`).

## Auth Coverage
All routes protected — same as Phase 0:
| Route | Phase 0 | Current |
|-------|---------|---------|
| POST /api/ai/stream-section | Clerk auth() ✅ | Clerk auth() ✅ |
| /api/trpc/[trpc] | protectedProcedure / orgProtectedProcedure ✅ | protectedProcedure / orgProtectedProcedure ✅ |
| POST /api/upload/kb | Clerk auth() ✅ | Clerk auth() ✅ |
| POST /api/upload | Clerk auth() ✅ | Clerk auth() ✅ |
| POST /api/webhooks/stripe | Stripe signature ✅ | Stripe signature ✅ |

### tRPC Router Coverage (all procedures use auth)
| Router | Protected Procedures |
|--------|---------------------|
| ai.ts | 7/7 orgProtectedProcedure |
| billing.ts | 3/3 protectedProcedure |
| kb.ts | 5/5 orgProtectedProcedure |
| proposal.ts | 8/8 orgProtectedProcedure |
| settings.ts | 5/5 orgProtectedProcedure |

## IDOR Verification
All DB queries include `orgId` scope — verified via unit tests and grep:
| Endpoint | Phase 0 | Current | Test Verification |
|---------|---------|---------|-----------------|
| proposal.get | SAFE | SAFE | `proposal.test.ts`: "always includes orgId in the where clause" ✅ |
| proposal.list | SAFE | SAFE | `proposal.test.ts`: "scopes the query to internalOrgId" ✅ |
| proposal.updateSection | SAFE | SAFE | `proposal.test.ts`: "verifies proposal ownership before updating section" ✅ |
| kb.get | SAFE | SAFE | `kb.test.ts`: "always includes orgId in the where clause" ✅ |
| kb.delete | SAFE | SAFE | `kb.test.ts`: "throws NOT_FOUND when attempting to delete another org's item" ✅ |
| /api/ai/stream-section | SAFE | SAFE | orgId from Clerk auth, Prisma query scoped ✅ |

## Secret Scan
- Gitleaks: not installed — manual scan performed
- `grep` for secret patterns (sk-, AKIA, ghp_, password=) across rescue diff: **0 matches**
- `git diff pre-rescue-20260409..HEAD | grep -i "secret\|key\|token\|password"`: only test mock references
- New secrets committed during rescue: **none**
- Existing env proxy pattern unchanged: all secrets still gated through `src/lib/config.ts`

## `any` Type Check (rescue commits only)
- `git diff pre-rescue-20260409..HEAD -- src/ | grep "^+" | grep "as any\|: any"`: **0 matches**
- Pre-existing `as any` in `src/app/_components/landing/`: 6 occurrences (href type workaround) — these are **pre-rescue** and not in any rescue commit
- Zero `@ts-ignore` in rescue commits confirmed

## Verdict
**PASS** — Zero CRITICAL findings. Zero HIGH findings. Zero SAST critical/high findings. All API routes protected. All ID-accepting endpoints org-scoped. Zero secrets committed during rescue. The 3 new Semgrep findings are INFO/WARNING severity, pre-rescue code, and are false positives upon inspection.
