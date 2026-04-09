import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Auto-load test credentials so callers don't need `source .env.test.local`
loadEnv({ path: ".env.test.local" });

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 1,
  fullyParallel: false, // sequential — tests share a single auth session
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3000",
    // storageState is NOT set here — it would be inherited by the setup project
    // before the file exists, causing ENOENT. Set it per-project below instead.
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    // 1. Auth setup — runs first, produces storageState.json.
    //    Must NOT have storageState set (the file doesn't exist yet).
    {
      name: "setup",
      testDir: "./tests",
      testMatch: /global-setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // 2. All spec files — depend on setup completing first, then load session.
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/fixtures/storageState.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/sign-in",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
