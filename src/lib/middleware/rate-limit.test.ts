import { checkRateLimit } from "./rate-limit";
import { RateLimitError } from "@/lib/types/errors";

describe("checkRateLimit", () => {
  // Use unique keys per test to avoid cross-test bucket contamination
  const key = (suffix: string) => `test:rate-limit:${Date.now()}:${suffix}`;

  it("allows the first request within limit", () => {
    expect(() => checkRateLimit(key("a"), 5, 60_000)).not.toThrow();
  });

  it("allows requests up to the limit", () => {
    const k = key("b");
    for (let i = 0; i < 5; i++) {
      expect(() => checkRateLimit(k, 5, 60_000)).not.toThrow();
    }
  });

  it("throws RateLimitError on the request that exceeds the limit", () => {
    const k = key("c");
    for (let i = 0; i < 5; i++) {
      checkRateLimit(k, 5, 60_000);
    }
    expect(() => checkRateLimit(k, 5, 60_000)).toThrow(RateLimitError);
  });

  it("thrown error carries the correct rate-limit code", () => {
    const k = key("d");
    for (let i = 0; i < 3; i++) {
      checkRateLimit(k, 3, 60_000);
    }
    try {
      checkRateLimit(k, 3, 60_000);
      fail("Expected RateLimitError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).code).toBe("RATE_LIMIT_ERROR");
      expect((err as RateLimitError).statusCode).toBe(429);
    }
  });

  it("resets after the window expires", () => {
    const k = key("e");
    // Exhaust the limit
    for (let i = 0; i < 2; i++) {
      checkRateLimit(k, 2, 1); // 1ms window
    }
    expect(() => checkRateLimit(k, 2, 1)).toThrow(RateLimitError);

    // Wait for window to expire, then the counter should reset
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(() => checkRateLimit(k, 2, 60_000)).not.toThrow();
        resolve();
      }, 5);
    });
  });

  it("tracks different keys independently", () => {
    const k1 = key("f1");
    const k2 = key("f2");
    // Exhaust k1
    for (let i = 0; i < 3; i++) {
      checkRateLimit(k1, 3, 60_000);
    }
    // k2 is unaffected
    expect(() => checkRateLimit(k2, 3, 60_000)).not.toThrow();
    // k1 is exhausted
    expect(() => checkRateLimit(k1, 3, 60_000)).toThrow(RateLimitError);
  });
});
