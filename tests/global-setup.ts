/**
 * global-setup.ts — Playwright auth setup
 *
 * Logs in once via the Clerk sign-in UI and saves the browser cookies/storage
 * to tests/fixtures/storageState.json so every test can reuse the session
 * without re-authenticating.
 *
 * Required env vars:
 *   E2E_TEST_EMAIL    — email of the test user (e.g. test@example.com)
 *   E2E_TEST_PASSWORD — password for that user
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

const STORAGE_STATE = path.join(__dirname, "fixtures", "storageState.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in the environment. " +
        "Copy .env.example to .env.test.local and fill in test credentials.",
    );
  }

  await page.goto("/sign-in");

  // --- Step 1: enter email ---
  // Clerk renders either a standard <input> or an iframe-less widget.
  // The identifier field is stable across Clerk versions.
  const emailInput = page.locator(
    'input[name="identifier"], input[type="email"]',
  );
  await emailInput.waitFor({ timeout: 10_000 });
  await emailInput.fill(email);

  // Click "Continue" (first step of Clerk's two-step flow).
  // If the form only has one step the button text may differ; fall back to type=submit.
  const continueBtn = page
    .getByRole("button", { name: /continue/i })
    .or(page.locator('button[type="submit"]'))
    .first();
  await continueBtn.click();

  // --- Step 2: enter password ---
  const passwordInput = page.locator(
    'input[name="password"], input[type="password"]',
  );
  await passwordInput.waitFor({ timeout: 10_000 });
  await passwordInput.fill(password);

  // Submit password form.
  const signInBtn = page
    .getByRole("button", { name: /sign in|continue/i })
    .or(page.locator('button[type="submit"]'))
    .first();
  await signInBtn.click();

  // Wait for successful redirect to dashboard.
  await page.waitForURL(/\/(dashboard|proposals|onboarding)/, {
    timeout: 20_000,
  });
  await expect(page).not.toHaveURL(/sign-in/);

  // Persist session for all tests.
  await page.context().storageState({ path: STORAGE_STATE });
});
