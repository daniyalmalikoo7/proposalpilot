/**
 * global-setup.ts — Playwright auth setup
 *
 * Uses @clerk/testing to authenticate programmatically, bypassing Clerk's
 * device-verification (factor-two) and bot-detection flows that break
 * headless browser sessions.
 *
 * Required env vars (auto-loaded by playwright.config.ts):
 *   From .env.local:
 *     CLERK_SECRET_KEY        — Clerk secret key (server-side)
 *     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — Clerk publishable key
 *   From .env.test.local:
 *     E2E_TEST_EMAIL          — test user email
 *     E2E_TEST_PASSWORD       — test user password
 */

import { test as setup } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import path from "path";
import fs from "fs";

const STORAGE_STATE = path.join(__dirname, "fixtures", "storageState.json");

fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set. " +
        "Add them to .env.test.local.",
    );
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error(
      "CLERK_SECRET_KEY must be set. It should be present in .env.local.",
    );
  }

  // Inject a Clerk testing token into the browser context.
  // This bypasses device-verification (factor-two) and bot-detection —
  // both of which break headless Playwright sessions.
  await setupClerkTestingToken({ page });

  // Navigate to sign-in so Clerk's JS is loaded
  await page.goto("/sign-in");

  // Sign in programmatically — no UI interaction needed
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password,
    },
  });

  // Land on a known authenticated route to ensure session cookies are set
  await page.waitForURL(/\/(dashboard|proposals|onboarding)/, {
    timeout: 30_000,
  });

  // Persist the authenticated session for all test specs
  await page.context().storageState({ path: STORAGE_STATE });
});
