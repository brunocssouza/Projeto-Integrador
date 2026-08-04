import { tooManyRequests } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getRedis, isRedisEnabled } from "@/infra/redis";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory fallback store (single-instance / dev only).
const store = new Map<string, RateLimitEntry>();
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
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
 * In-memory rate limit (used as fallback when Redis is unavailable).
 */
function rateLimitMemory(opts: RateLimitOptions): RateLimitResult {
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
    logger.warn("Rate limit exceeded (memory)", { key, count: existing.count, max });
    return { allowed: false, remaining: 0, retryAfter };
  }
  return { allowed: true, remaining: max - existing.count, retryAfter: 0 };
}

/**
 * Redis-backed fixed-window rate limit (works across multiple app instances).
 * Uses INCR + EXPIRE on a key scoped to the window.
 */
async function rateLimitRedis(opts: RateLimitOptions): Promise<RateLimitResult> {
  const { key, max, windowSec } = opts;
  const redis = await getRedis();
  if (!redis) return rateLimitMemory(opts);

  const redisKey = `ratelimit:${key}`;
  try {
    // INCR is atomic; first increment sets it to 1.
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSec);
    }
    const ttl = await redis.pttl(redisKey);
    const retryAfter = ttl > 0 ? Math.ceil(ttl / 1000) : windowSec;

    if (count > max) {
      logger.warn("Rate limit exceeded (redis)", { key, count, max });
      return { allowed: false, remaining: 0, retryAfter };
    }
    return { allowed: true, remaining: Math.max(0, max - count), retryAfter: 0 };
  } catch (err) {
    // Redis error → degrade to in-memory so the request isn't blocked.
    logger.error("Redis rate limit failed, falling back to memory", {
      error: err instanceof Error ? err.message : String(err),
    });
    return rateLimitMemory(opts);
  }
}

/**
 * Rate limit check. Uses Redis when available (multi-instance safe),
 * otherwise in-memory (single-instance). Async to support Redis.
 */
export async function rateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  if (isRedisEnabled()) return rateLimitRedis(opts);
  return rateLimitMemory(opts);
}

/**
 * Assert rate limit. Throws 429 if exceeded.
 */
export async function assertRateLimit(opts: RateLimitOptions): Promise<void> {
  const result = await rateLimit(opts);
  if (!result.allowed) {
    throw tooManyRequests("Muitas requisições. Tente novamente mais tarde.", result.retryAfter);
  }
}

/**
 * Rate limit by IP address.
 */
export async function rateLimitByIp(
  ip: string,
  endpoint: string,
  max: number,
  windowSec: number
): Promise<void> {
  await assertRateLimit({ key: `ip:${ip}:${endpoint}`, max, windowSec });
}

/**
 * Rate limit by user ID.
 */
export async function rateLimitByUser(
  userId: string,
  endpoint: string,
  max: number,
  windowSec: number
): Promise<void> {
  await assertRateLimit({ key: `user:${userId}:${endpoint}`, max, windowSec });
}
