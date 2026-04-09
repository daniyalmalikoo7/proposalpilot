import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Load base secrets (CLERK_SECRET_KEY etc.) then overlay test credentials
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env.test.local", override: true });

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: require.resolve("./tests/clerk-global-setup"),
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
    //    Timeout raised to 60s — clerk.signIn makes API calls to Clerk.
    {
      name: "setup",
      testDir: "./tests",
      testMatch: /global-setup\.ts/,
      timeout: 60_000,
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
