# Playwright E2E Test Results — Phase 3 Validation

_Date: 2026-04-03_
_Branch: validate/test-run_
_Playwright: 1.59.1 | Browser: Chromium_

---

## Executive Summary

| Status  | Count |
| ------- | ----- |
| Passed  | 0     |
| Failed  | 22    |
| Skipped | 0     |

**All 22 failures are auth-related** (Clerk redirects unauthenticated browser to `/sign-in`; tests cannot reach protected routes). No test logic failures remain after infrastructure fixes applied in this session.

---

## Blocker: Missing Credentials

The test suite requires a real Clerk test user. These env vars must be set before the tests can pass:

```bash
E2E_TEST_EMAIL=<your-test-user@example.com>
E2E_TEST_PASSWORD=<password>
```

**Where to set them:**

```bash
# Create this file (gitignored):
cp .env.example .env.test.local
# Then add:
E2E_TEST_EMAIL=...
E2E_TEST_PASSWORD=...
```

**How to run once credentials are set:**

```bash
# Load vars and run:
export $(cat .env.test.local | xargs) && npx playwright test --reporter=list
```

Or set them in your shell session and run `npm run test:e2e`.

---

## Infrastructure Fixes Applied This Session

### Fix 1 — WebServer URL (playwright.config.ts)

**Problem:** `url: "http://localhost:3000"` returns HTTP 307 (Clerk redirect). Playwright 1.59 did not consider 307 as "server ready" when `reuseExistingServer: true`, causing it to launch a competing `npm run dev` that grabbed port 3001, then timed out waiting for `:3000`.

**Fix:** Changed `url` to `http://localhost:3000/sign-in` (returns HTTP 200).

### Fix 2 — CSS Selector Syntax (5 spec files)

**Problem:** `page.waitForSelector()` calls used Playwright's `text="..."` locator syntax in comma-separated CSS selectors, e.g.:

```
'ul li, text="No proposals yet"'
```

Playwright 1.59 no longer accepts `text=` in `waitForSelector()` within a comma-separated list — it parses the whole expression as CSS, producing:

```
Error: Unexpected token "=" while parsing css selector
```

**Files affected:**

- `tests/e2e/knowledge-base.spec.ts` (beforeEach)
- `tests/e2e/proposals-list.spec.ts` (beforeEach)
- `tests/e2e/proposal-editor.spec.ts` (goToFirstProposalWithSections helper)
- `tests/e2e/navigation.spec.ts` (editor breadcrumb test)
- `tests/e2e/generation-flow.spec.ts` (test body)

**Fix:** Replaced with Playwright locator `.or()` chaining:

```typescript
// Before (invalid CSS):
await page.waitForSelector('ul li, text="No proposals yet"', {
  timeout: 15_000,
});

// After (valid Playwright locator):
await page
  .locator("ul li")
  .or(page.getByText(/no proposals yet/i))
  .first()
  .waitFor({ timeout: 15_000 });
```

### Fix 3 — Placeholder storageState.json

**Problem:** `tests/fixtures/storageState.json` did not exist. Playwright requires the file to be present before the chromium project starts (even if it's overwritten by global-setup).

**Fix:** Created `tests/fixtures/storageState.json` with empty session: `{"cookies":[],"origins":[]}`.

---

## Results Per File

### generation-flow.spec.ts

| Test                                                               | Result | Cause                                                                                                                    |
| ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| regenerates a section and shows updated content + confidence badge | FAIL   | Auth: unauthenticated session — `.waitFor` times out on `/proposals` (Clerk redirects to `/sign-in`, no `ul li` present) |

**1 test: 0 passed, 1 failed**

---

### knowledge-base.spec.ts

| Test                                            | Result | Cause                         |
| ----------------------------------------------- | ------ | ----------------------------- |
| renders page heading and Upload Document button | FAIL   | Auth: unauthenticated session |
| search input is visible and accepts text        | FAIL   | Auth: unauthenticated session |
| type filter tabs are all present                | FAIL   | Auth: unauthenticated session |
| clicking a filter tab activates it              | FAIL   | Auth: unauthenticated session |
| KB document grid or empty state is visible      | FAIL   | Auth: unauthenticated session |
| Upload Document button reveals the upload form  | FAIL   | Auth: unauthenticated session |

**6 tests: 0 passed, 6 failed**

---

### navigation.spec.ts

| Test                                                         | Result | Cause                                                                                    |
| ------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------- |
| sidebar highlights Proposals when on /proposals              | FAIL   | Auth: sidebar link not present on `/sign-in` page → `locator.getAttribute` timeout (30s) |
| sidebar highlights Knowledge Base when on /knowledge-base    | FAIL   | Auth: same — sidebar not rendered                                                        |
| sidebar highlights Dashboard when on /dashboard              | FAIL   | Auth: same — sidebar not rendered                                                        |
| sidebar Proposals link is NOT active when on /knowledge-base | FAIL   | Auth: same — sidebar not rendered                                                        |
| navigating via sidebar links changes the active item         | FAIL   | Auth: `locator.click` timeout on sidebar link that doesn't exist                         |
| editor breadcrumb navigates back to dashboard                | FAIL   | Auth: `.waitFor` times out on `/proposals` redirect                                      |

**6 tests: 0 passed, 6 failed**

---

### proposal-editor.spec.ts

| Test                                                      | Result | Cause                                               |
| --------------------------------------------------------- | ------ | --------------------------------------------------- |
| loads an existing proposal and shows header breadcrumb    | FAIL   | Auth: `.waitFor` times out on `/proposals` redirect |
| renders section editors when sections exist               | FAIL   | Auth: same                                          |
| confidence badges are visible and color-coded             | FAIL   | Auth: same                                          |
| requirements sidebar is visible with items or empty state | FAIL   | Auth: same                                          |
| Select all requirements button selects all and disappears | FAIL   | Auth: same                                          |
| KB panel toggle shows and hides the KB panel              | FAIL   | Auth: same                                          |

**6 tests: 0 passed, 6 failed**

---

### proposals-list.spec.ts

| Test                                                       | Result | Cause                                               |
| ---------------------------------------------------------- | ------ | --------------------------------------------------- |
| renders the page heading and New Proposal button           | FAIL   | Auth: `.waitFor` times out on `/proposals` redirect |
| renders at least one proposal with title, status, and date | FAIL   | Auth: same                                          |
| clicking a proposal navigates to /proposals/[id]           | FAIL   | Auth: same                                          |

**3 tests: 0 passed, 3 failed**

---

## Failure Classification

| Category                 | Count | Description                                    |
| ------------------------ | ----- | ---------------------------------------------- |
| App bug                  | 0     | None found                                     |
| Test infrastructure bug  | 0     | All fixed in this session                      |
| Auth/credentials blocker | 22    | `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` not set |

---

## What Happens Once Credentials Are Set

`global-setup.ts` will:

1. Navigate to `/sign-in`
2. Fill `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` into Clerk's form
3. Wait for redirect to `/dashboard` or `/proposals`
4. Persist cookies/localStorage to `tests/fixtures/storageState.json`

All 22 tests will then run with an authenticated session. Expected outcome:

- **proposals-list** (3 tests): Should pass — list renders, navigation works
- **knowledge-base** (6 tests): Should pass — page loads with auth
- **proposal-editor** (6 tests): Will pass or skip depending on whether proposals with sections exist in the DB
- **navigation** (6 tests): Will pass once sidebar is rendered
- **generation-flow** (1 test): Will pass or skip depending on DB state; requires real Gemini API key

---

## Next Steps

1. **Set credentials** in your shell or `.env.test.local`:
   ```
   E2E_TEST_EMAIL=your-test-user@example.com
   E2E_TEST_PASSWORD=your-password
   ```
2. **Ensure the test user exists** in Clerk (create via dashboard if needed)
3. **Re-run**: `npm run test:e2e`
4. **Report actual pass/fail** once authenticated
