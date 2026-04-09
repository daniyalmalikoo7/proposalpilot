/**
 * clerk-global-setup.ts
 *
 * Playwright globalSetup entry point.
 * Calls clerkSetup() to initialise the Clerk testing token BEFORE any
 * browser context is created.  This is required by @clerk/testing —
 * setupClerkTestingToken() in per-test setup will fail unless this runs first.
 *
 * Env vars are loaded here explicitly because this module runs in a separate
 * Node process before playwright.config.ts dotenv loading takes effect.
 */

import { clerkSetup } from "@clerk/testing/playwright";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env.test.local", override: true });

export default async function globalSetup() {
  await clerkSetup();
}
