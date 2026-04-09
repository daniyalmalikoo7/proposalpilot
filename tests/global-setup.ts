/**
 * global-setup.ts — Playwright auth setup
 *
 * Logs in once via the Clerk sign-in UI and saves the browser cookies/storage
 * to tests/fixtures/storageState.json so every test can reuse the session
 * without re-authenticating.
 *
 * Required env vars (auto-loaded from .env.test.local by playwright.config.ts):
 *   E2E_TEST_EMAIL    — email of the test user
 *   E2E_TEST_PASSWORD — password for that user
 *
 * Handles Clerk's multi-step flow:
 *   1. Enter email → click Continue (the form submit, not Google OAuth)
 *   2. If Clerk offers social/SSO options, pick "Continue with password"
 *   3. Enter password → submit
 *   4. Wait for redirect into the app
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const STORAGE_STATE = path.join(__dirname, "fixtures", "storageState.json");

// Ensure the fixtures directory exists before Playwright tries to write to it.
fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

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

  // ── Step 1: fill email ────────────────────────────────────────────────────
  const emailInput = page.locator(
    'input[name="identifier"], input[type="email"]',
  );
  await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  await emailInput.fill(email);

  // Submit via Enter — avoids accidentally clicking a "Continue with Google"
  // button when Clerk renders social login options alongside the email form.
  await emailInput.press("Enter");

  // ── Step 2: handle Clerk's intermediate screen (if shown) ─────────────────
  // After email submission, Clerk may show:
  //   (a) directly the password field, OR
  //   (b) a screen offering social/SSO login + "Use password" / "Use another method" link
  // We wait up to 10s for either to appear.
  const passwordField = page.locator(
    'input[name="password"], input[type="password"]',
  );
  const usePasswordLink = page.getByRole("link", {
    name: /use your password|use password|another method/i,
  });
  const usePasswordBtn = page.getByRole("button", {
    name: /use your password|use password|another method|continue with password/i,
  });

  // Race: whichever appears first
  await Promise.race([
    passwordField.waitFor({ state: "visible", timeout: 15_000 }),
    usePasswordLink.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {}),
    usePasswordBtn.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {}),
  ]);

  // If Clerk presented the "choose a method" screen, navigate to password
  if (await usePasswordLink.isVisible()) {
    await usePasswordLink.click();
  } else if (await usePasswordBtn.isVisible()) {
    await usePasswordBtn.click();
  }

  // ── Step 3: wait for password field to be visible AND enabled ─────────────
  await passwordField.waitFor({ state: "visible", timeout: 10_000 });
  // Clerk briefly disables the field while transitioning — wait for enabled
  await page.waitForFunction(
    () => {
      const el = document.querySelector<HTMLInputElement>(
        'input[name="password"], input[type="password"]',
      );
      return el && !el.disabled && el.offsetParent !== null;
    },
    { timeout: 10_000 },
  );

  await passwordField.fill(password);

  // ── Step 4: submit password ───────────────────────────────────────────────
  // Prefer the primary form button; fall back to Enter key
  const signInBtn = page
    .locator('button.cl-formButtonPrimary, button[data-locator*="submit"]')
    .or(page.getByRole("button", { name: /sign in|continue$/i }))
    .first();

  if (await signInBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await signInBtn.click();
  } else {
    await passwordField.press("Enter");
  }

  // ── Step 5: handle Clerk device-verification / MFA (factor-two) ─────────
  // When logging in from a new browser context, Clerk may redirect to
  // /sign-in/factor-two and ask for an email OTP code.
  // In Clerk's Development mode the magic bypass code is always "424242".
  await page.waitForURL(
    /\/(dashboard|proposals|onboarding|sign-in\/factor-two)/,
    { timeout: 30_000 },
  );

  if (page.url().includes("factor-two")) {
    const otpInput = page.locator(
      'input[name="code"], input[aria-label*="digit"], [data-otp-input] input, input[autocomplete="one-time-code"]',
    ).or(page.getByRole("textbox", { name: /verification code|enter code/i }))
      .first();

    // Fallback: any single visible text input on the factor-two page
    const anyInput = page.locator('input[type="text"], input:not([type])').first();

    await otpInput
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => anyInput.waitFor({ state: "visible", timeout: 5_000 }));

    const target = (await otpInput.isVisible()) ? otpInput : anyInput;

    // Clerk dev-mode bypass: "424242" is always accepted as a valid OTP
    await target.fill("424242");

    const continueBtn = page.getByRole("button", { name: /continue/i }).first();
    if (await continueBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await continueBtn.click();
    } else {
      await target.press("Enter");
    }

    // Now wait for the app redirect
    await page.waitForURL(/\/(dashboard|proposals|onboarding)/, {
      timeout: 30_000,
    });
  }

  await expect(page).not.toHaveURL(/sign-in/);

  // Persist session for all subsequent tests.
  await page.context().storageState({ path: STORAGE_STATE });
});
