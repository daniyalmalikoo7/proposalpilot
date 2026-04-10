# Rescue Retrospective

## Rescue Summary
- **Pre-rescue health score:** 60/100
- **Triaged findings:** 16 total (1 CRITICAL, 3 HIGH, 7 MEDIUM, 5 LOW)
- **Fixed (Layers 0–4):** 4 CRITICAL/HIGH resolved, Layer 0 auto-fixes applied, 10 new unit tests
- **Deferred (Layer 5):** 8 items (M1, M2, M3, M5, M7, L1, L3, L5)
- **Validation:** All 5 validators passed, 0 CRITICAL, 0 HIGH remaining

## Participants
- Devil's Advocate
- Security Engineer
- QA Lead

---

## Pre-Ship Concerns

### Devil's Advocate

**1. The CRITICAL finding was never a code defect.** C1 (runtime instability) was classified CRITICAL and drove the entire rescue urgency, but the root cause turned out to be the audit methodology (`-H 127.0.0.1` flag interfering with Turbopack's proxy). No code change was made to fix it. This means our Phase 0 health score of 60/100 was artificially depressed — the real pre-rescue score was closer to 72/100 (if runtime had scored 60/100 instead of 0). The rescue was less dire than we thought.

**2. E2E tests were never executed.** 23 Playwright test cases exist across 5 spec files, but not a single one ran during this rescue. They require Clerk test credentials in `.env.test.local` and a `clerk-global-setup.ts` auth flow. We're declaring QA PASS based on 47 unit tests and curl probes — that's a weaker signal than we're presenting.

**3. Layer 5 deferred items include real debt.** 14 packages are major versions behind. Stripe is 5 majors behind (17 → 22). Clerk is 1 major behind (6 → 7). These aren't cosmetic — major versions mean API changes, security patches, and eventual forced upgrades. We're shipping with known version debt.

### Security Engineer

**1. The `sanitizeForPrompt` fix is defence-in-depth, not a primary control.** The `renderPrompt` function already calls `sanitizeForPrompt` on every template variable via its regex replacement loop. The fix we applied adds per-field sanitization *before* concatenation, matching the streaming endpoint's pattern. This is correct and reduces attack surface, but it means the MEDIUM prompt injection finding was arguably lower risk than classified — the primary control was already in place. I want to be honest about this: we fixed a real gap, but the app wasn't actively vulnerable.

**2. `as any` in landing components is a broken window.** Six instances of `as any` exist on typed route `href` props. These are pre-existing and low-risk, but they're the kind of thing that normalizes `as any` usage for future developers. They should be fixed with proper route type casting.

**3. Billing webhook handler has no unit tests.** The Stripe webhook handler (`/api/webhooks/stripe/route.ts`) processes payment events and provisions organization plans. It's signature-verified, but there are zero tests for its business logic. If someone changes the webhook handling during a Stripe SDK upgrade, there's no safety net.

### QA Lead

**1. We validated HTTP status codes, not rendered content.** Our "runtime fix" verification was 7 curl probes checking status codes (200, 307). We never verified that the pages actually *render content* — the landing page could return 200 with a blank body or a React error boundary, and our probes wouldn't catch it. Lighthouse ran on landing and sign-in (confirming they render), but the auth-protected pages were only verified as returning 307 redirects.

**2. Database connectivity was never tested.** The Prisma migration status check failed in Phase 0 with `P1001` (connection refused), and this was never re-tested. We don't know if the DB schema is in sync with the Prisma schema. Any tRPC procedure that touches the database (which is most of them) is untested against a real database.

**3. The unit test pattern is fragile.** The existing tests (and the new AI router tests) use inline procedure recreation to avoid ESM import issues with `superjson`. This means we're testing *recreated* logic, not the actual router code. If someone changes the router but forgets to update the test's recreated procedure, the test still passes. This is a known limitation of the Jest + ESM + Next.js stack, but it's a real confidence gap.

---

## Cross-Discussion

**Devil's Advocate challenges Security:** "You say the prompt injection fix is defence-in-depth. But the audit report classified it as HIGH (H3), the fix plan allocated it to Layer 2, and the security report says prompt injection was 'downgraded from MEDIUM to LOW.' If the primary control was already in place, was this even a HIGH finding?"

**Security responds:** "It was correctly classified. The streaming endpoint had explicit per-field sanitization and the tRPC endpoint didn't. If someone later refactors `renderPrompt` to not sanitize (or changes the template syntax), the tRPC endpoint would be wide open. Defence-in-depth matters *because* primary controls fail. The classification was right; the fix was right; the risk was real."

**QA challenges Devil's Advocate:** "You say the rescue was less dire than we thought because C1 was environmental. But we also couldn't run Semgrep (H2 — also environmental) or check DB connectivity. How much of our Phase 0 picture was distorted by environment? Could there be issues we still haven't seen?"

**Devil's Advocate concedes:** "Fair point. The Semgrep re-run in Phase 2 found only false positives, which is reassuring. DB connectivity is the real unknown — we genuinely don't know if migrations are in sync."

**Security challenges QA:** "You say unit tests test recreated logic, not actual code. But the sanitization tests import the real `sanitizeForPrompt` function — they test actual sanitization behavior, not mocked logic. The org-scoping tests are the ones testing recreated procedures."

**QA responds:** "Correct. The sanitization tests are strong. The org-scoping tests are the fragile ones. But org-scoping is arguably the most important thing to test — it's the IDOR boundary."

---

## Top 3 Risks

1. **E2E tests not executed** — Severity: MEDIUM — Mitigation: Run the full Playwright suite with Clerk test credentials before production deploy. This is the #1 pre-production gate. If E2E tests fail, do not ship.

2. **Database connectivity and migration status unknown** — Severity: MEDIUM — Mitigation: Verify `prisma migrate status` against the production/staging database. Confirm no pending migrations or schema drift before deploy.

3. **Major dependency versions behind (Stripe +5, Clerk +1, Prisma +1)** — Severity: LOW (immediate), MEDIUM (6-month horizon) — Mitigation: Schedule a dependency upgrade sprint within 2 weeks of ship. Prioritize Stripe (largest gap) and Clerk (auth provider — security-critical).

---

## Recommendation

**SHIP WITH CONDITIONS**

The codebase is in good shape: build clean, types clean, security scan clean, auth coverage 100%, prompt injection fixed, 47 unit tests passing. The rescue accomplished what it set out to do.

However, before production deploy:
1. Run the full Playwright E2E suite with real Clerk test credentials
2. Verify `prisma migrate status` against the target database
3. Confirm the dev server starts cleanly in the deployment environment (not just this workstation)

If all three pass, ship. If any fail, fix and re-validate.
