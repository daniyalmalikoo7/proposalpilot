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

**1. The UI/UX standard was never enforced — and it says it's mandatory.** The rescue's own `uiux-standard.md` states: "Loading states, error states, and empty states are MANDATORY for any feature touched during rescue." The Feature Fixer mandate requires: "Every fixed component has loading, error, AND empty states." Yet no validator checked this. The evidence:
- 3 of the 7 app routes lack a `loading.tsx` Suspense boundary: `/knowledge-base`, `/proposals`, and `/proposals/[id]`. These are the three most data-intensive pages in the entire application.
- Lighthouse Performance scored 64–68, below the ≥70 target stated in the standard's "Performance as UX" principle (Rule #06).
- Lighthouse Best Practices scored 73, below the ≥80 target.
- Color contrast violations exist on the landing page (`text-indigo-600/30` at 30% opacity, `text-slate-500`).
- No visual regression testing was performed during the rescue.

This is not a minor cosmetic gap. The standard says "performance is UX" and "accessibility is not optional" — and both benchmarks failed. We wrote the rules, then skipped verifying them.

**2. The CRITICAL finding was never a code defect.** C1 (runtime instability) was classified CRITICAL and drove the entire rescue urgency, but the root cause turned out to be the audit methodology (`-H 127.0.0.1` flag interfering with Turbopack's proxy). No code change was made to fix it. The real pre-rescue score was closer to 72/100.

**3. E2E tests were never executed.** 23 Playwright test cases exist across 5 spec files, but not a single one ran during this rescue. They require Clerk test credentials. We're declaring QA PASS based on 47 unit tests and curl probes.

### Security Engineer

**1. The `sanitizeForPrompt` fix is defence-in-depth, not a primary control.** The `renderPrompt` function already calls `sanitizeForPrompt` on every template variable. The fix we applied adds per-field sanitization *before* concatenation. This is correct and reduces attack surface, but the app wasn't actively vulnerable — the primary control was already in place. We fixed a real gap; we should be honest about the pre-existing risk level.

**2. `as any` in landing components is a broken window.** Six instances of `as any` exist on typed route `href` props. Pre-existing and low-risk, but they normalize `as any` usage for future developers.

**3. Billing webhook handler has no unit tests.** The Stripe webhook handler processes payment events and provisions organization plans. It's signature-verified, but there are zero tests for its business logic. A Stripe SDK upgrade could break billing with no test to catch it.

### QA Lead

**1. We validated HTTP status codes, not rendered content.** Our "runtime fix" verification was 7 curl probes checking status codes (200, 307). We never verified that pages render real content. Lighthouse ran on landing and sign-in only — the auth-protected pages (dashboard, proposals, KB, settings) were only verified as returning 307 redirects, not as rendering correctly for authenticated users.

**2. Database connectivity was never tested.** The Prisma migration status check failed in Phase 0 with `P1001` (connection refused) and was never re-tested. We don't know if the DB schema is in sync. Any tRPC procedure that touches the database is untested against a real database.

**3. The missing `loading.tsx` files are a real user experience problem, not just a standard violation.** When `/proposals` or `/knowledge-base` fetches data, there's no Suspense boundary — the user sees either a white flash or a layout shift. The Next.js App Router streams HTML progressively, and without `loading.tsx`, the shell renders instantly but the data-dependent content pops in with no transition. The UI/UX standard (Rule #02) says "motion is communication" and "no jarring content shifts." These three pages violate that on every navigation.

---

## Cross-Discussion

**Devil's Advocate opens:** "I want to start with the UI/UX standard because it's the one risk everyone glossed over. The Performance Engineer report says 'PASS — no CRITICAL performance issues' but then reports Lighthouse Performance at 64 and Best Practices at 73. Both are below the targets we set in our own standard (≥70 and ≥80). How is that a PASS?"

**QA responds:** "The Performance Engineer noted these were measured against a dev server with Turbopack HMR. Production builds would score higher. That caveat is legitimate — dev mode includes debug bundles, source maps, and unminified assets."

**Devil's Advocate pushes back:** "Then why set ≥70 as the target if we're going to waive it for dev-mode measurements? Either the target is wrong or the measurement is wrong. We shouldn't have both and then declare PASS."

**Security weighs in:** "I agree with the Devil's Advocate on the `loading.tsx` gap specifically. The three missing pages — knowledge-base, proposals, proposals/[id] — are exactly the pages that handle the most sensitive user data. If a user navigates to `/proposals` and there's no loading state, the page flash could expose a FOUC that briefly reveals stale content from a previous route via the browser's bfcache. It's a minor information leak vector, but it's the kind of thing that compounds."

**QA adds:** "Beyond security, the empty `loading.tsx` gap means the 5 existing E2E tests in `navigation.spec.ts` are timing-fragile. Without Suspense boundaries, `waitForLoadState('networkidle')` in Playwright relies on the network going quiet, which is flaky with streaming SSR. Adding `loading.tsx` would make those tests more reliable too."

**Devil's Advocate on E2E tests:** "We have 23 E2E test cases that exist but were never run. How do we even know they pass? They could be silently broken. Declaring 'E2E test infrastructure exists and covers critical paths' in the QA report is misleading if we've never executed them."

**Security responds:** "The E2E tests are less concerning to me than the billing handler gap. If someone upgrades Stripe from v17 to v22 (which is in the deferred backlog), the webhook event schema will change. There are zero tests to catch that. That's a revenue-impacting regression risk."

**QA challenges Devil's Advocate on severity:** "You want to classify UI/UX benchmark enforcement as HIGH. I'd agree, but only because it's a compound issue: missing loading states + below-target Lighthouse + no visual testing + the standard says MANDATORY. Any one of those alone would be MEDIUM. Together they're HIGH because they signal that our validation process has a blind spot."

**Devil's Advocate concludes:** "That's exactly my point. The rescue pipeline has 5 validators, but none of them checked the UI/UX standard's mandatory requirements. We have a skill file that says 'loading/error/empty states are MANDATORY,' a Feature Fixer runbook that says 'verify loading, error, AND empty states exist,' and zero evidence that either was checked. The standard exists on paper only."

---

## Top 3 Risks

1. **Missing UI/UX benchmark enforcement** — Severity: **HIGH** — Three data-heavy pages (`/knowledge-base`, `/proposals`, `/proposals/[id]`) lack `loading.tsx` Suspense boundaries, violating the rescue UI/UX standard's mandatory loading-state requirement. Lighthouse Performance (64–68) and Best Practices (73) both fall below declared targets (≥70, ≥80). No validator checked these mandatory requirements during Phase 3.

   **Mitigation:**
   - Add `loading.tsx` with skeleton loaders to `/knowledge-base`, `/proposals`, and `/proposals/[id]` — matching the existing pattern in `/dashboard/loading.tsx`.
   - Re-run Lighthouse against a production build (`next build && next start`) to get accurate performance scores. If still below target, address the 481KB chunk via lazy-loading Tiptap.
   - Fix the landing page color contrast violations (`text-indigo-600/30` → `/40`, `text-slate-500` → `text-slate-600`).
   - Add a UI/UX validation step to the Phase 3 validator sequence for future rescues.

2. **E2E tests not executed** — Severity: **MEDIUM** — 23 Playwright test cases exist but were never run (require Clerk auth credentials). Test correctness is unverified.

   **Mitigation:** Run the full Playwright suite with Clerk test credentials before production deploy. If any test fails, fix before shipping.

3. **Database connectivity and migration status unknown** — Severity: **MEDIUM** — Prisma `migrate status` failed with `P1001` in Phase 0 and was never re-tested. Schema drift is possible.

   **Mitigation:** Verify `prisma migrate status` against the production/staging database. Confirm no pending migrations or drift before deploy.

---

## Recommendation

**SHIP WITH CONDITIONS**

The codebase is structurally sound: build clean, types clean, security scan clean, auth 100%, prompt injection fixed, 47 unit tests passing. The rescue fixed every CRITICAL and HIGH finding it set out to fix.

However, the UI/UX standard — the rescue's own quality benchmark — was not enforced. Before production deploy:

1. **[HIGH]** Add `loading.tsx` to the 3 missing routes and fix landing page contrast violations
2. **[MEDIUM]** Run the full Playwright E2E suite with Clerk test credentials
3. **[MEDIUM]** Verify `prisma migrate status` against the target database
4. **[MEDIUM]** Re-run Lighthouse against a production build to get accurate scores

If conditions 1–3 pass, ship. Condition 4 informs post-ship optimization priority.
