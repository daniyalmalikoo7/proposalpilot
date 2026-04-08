/** @type {import('jest').Config} */
const config = {
  // Use Next.js babel transform so @/ path aliases and TypeScript work
  transform: {
    "^.+\\.(t|j)sx?$": ["babel-jest", { presets: ["next/babel"] }],
  },
  // Map @/* imports to src/* matching tsconfig paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Server-side logic (tRPC, rate-limit, prompts) uses Node — not jsdom
  testEnvironment: "node",
  // Only pick up test files in src/ (not E2E tests in tests/)
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  // Setup file for jest-dom matchers
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Ignore E2E tests and build output
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/tests/"],
  // Collect coverage from src only
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**",
  ],
};

module.exports = config;
