// In-memory sliding-window rate limiter.
// SEC-004: Enforces per-user request limits on AI and upload endpoints.
// Production: replace with Redis-backed limiter (e.g. @upstash/ratelimit).

import { RateLimitError } from "@/lib/types/errors";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically purge expired entries to prevent memory growth
const CLEANUP_INTERVAL_MS = 5 * 60_000;
setInterval(() => {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  });
}, CLEANUP_INTERVAL_MS).unref();

/**
 * Check and increment rate limit for a given key (typically userId + endpoint).
 * @param key - Unique identifier (e.g. `ai:${userId}` or `upload:${userId}`)
 * @param limit - Max requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @throws RateLimitError if limit exceeded
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count++;
  if (bucket.count > limit) {
    throw new RateLimitError(
      `Rate limit exceeded: ${limit} requests per ${Math.round(windowMs / 1000)}s`,
    );
  }
}
