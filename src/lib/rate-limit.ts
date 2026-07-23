import { tooManyRequests } from "@/lib/errors";
import { logger } from "@/lib/logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

interface RateLimitOptions {
  key: string;
  max: number;
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

/**
 * In-memory sliding window rate limiter.
 * Works for single-instance deployments.
 */
export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const { key, max, windowSec } = opts;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  existing.count++;

  if (existing.count > max) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    logger.warn("Rate limit exceeded", { key, count: existing.count, max });
    return { allowed: false, remaining: 0, retryAfter };
  }

  return {
    allowed: true,
    remaining: max - existing.count,
    retryAfter: 0,
  };
}

/**
 * Assert rate limit. Throws 429 if exceeded.
 */
export function assertRateLimit(opts: RateLimitOptions): void {
  const result = rateLimit(opts);
  if (!result.allowed) {
    throw tooManyRequests("Muitas requisições. Tente novamente mais tarde.", result.retryAfter);
  }
}

/**
 * Rate limit by IP address.
 */
export function rateLimitByIp(ip: string, endpoint: string, max: number, windowSec: number): void {
  assertRateLimit({ key: `ip:${ip}:${endpoint}`, max, windowSec });
}

/**
 * Rate limit by user ID.
 */
export function rateLimitByUser(
  userId: string,
  endpoint: string,
  max: number,
  windowSec: number
): void {
  assertRateLimit({ key: `user:${userId}:${endpoint}`, max, windowSec });
}
