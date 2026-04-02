import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 1,
  fullyParallel: false, // sequential — tests share a single auth session
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3000",
    storageState: "tests/fixtures/storageState.json",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    // 1. Auth setup — runs first, produces storageState.json
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // 2. All spec files depend on setup completing first
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
