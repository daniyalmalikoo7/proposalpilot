// Centralized environment variable access with lazy validation.
// ALL server-side env access MUST go through this module — never read process.env directly.
// Validation is deferred to first access so Next.js build doesn't fail on missing runtime vars.

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

interface Env {
  readonly CLERK_SECRET_KEY: string;
  readonly GOOGLE_GEMINI_API_KEY: string;
  readonly VOYAGE_API_KEY: string | undefined;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly STRIPE_PRICE_STARTER: string | undefined;
  readonly STRIPE_PRICE_GROWTH: string | undefined;
  readonly STRIPE_PRICE_SCALE: string | undefined;
  readonly STRIPE_PRICE_ENTERPRISE: string | undefined;
}

// Lazy proxy — validates each required var on first access, not at import time.
// This avoids build-time failures in Next.js while still failing fast at runtime.
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    switch (prop) {
      // Required
      case "CLERK_SECRET_KEY":
      case "GOOGLE_GEMINI_API_KEY":
      case "STRIPE_SECRET_KEY":
      case "STRIPE_WEBHOOK_SECRET":
        return requireEnv(prop);

      // Optional
      case "VOYAGE_API_KEY":
      case "STRIPE_PRICE_STARTER":
      case "STRIPE_PRICE_GROWTH":
      case "STRIPE_PRICE_SCALE":
      case "STRIPE_PRICE_ENTERPRISE":
        return optionalEnv(prop);

      default:
        return undefined;
    }
  },
});
