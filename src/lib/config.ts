// Validates required environment variables at import time.
// Import this module early (e.g., in server entry points) to fail fast on misconfiguration.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check .env.example for the expected variables.`,
    );
  }
  return value;
}

export const env = {
  STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
  ANTHROPIC_API_KEY: requireEnv("ANTHROPIC_API_KEY"),
  CLERK_SECRET_KEY: requireEnv("CLERK_SECRET_KEY"),
} as const;
