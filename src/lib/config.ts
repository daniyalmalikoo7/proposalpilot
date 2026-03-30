// Validates required environment variables at import time.
// Import this module early (e.g., in server entry points) to fail fast on misconfiguration.
// ALL server-side env access MUST go through this module — never read process.env directly.

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

function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  // Auth
  CLERK_SECRET_KEY: requireEnv("CLERK_SECRET_KEY"),

  // AI
  ANTHROPIC_API_KEY: requireEnv("ANTHROPIC_API_KEY"),
  VOYAGE_API_KEY: optionalEnv("VOYAGE_API_KEY"),

  // Stripe
  STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_STARTER: optionalEnv("STRIPE_PRICE_STARTER"),
  STRIPE_PRICE_GROWTH: optionalEnv("STRIPE_PRICE_GROWTH"),
  STRIPE_PRICE_SCALE: optionalEnv("STRIPE_PRICE_SCALE"),
  STRIPE_PRICE_ENTERPRISE: optionalEnv("STRIPE_PRICE_ENTERPRISE"),
} as const;
