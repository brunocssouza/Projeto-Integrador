/**
 * Shared Redis client (ioredis singleton).
 *
 * Used for cross-instance state: rate limiting, caches, idempotency keys.
 * Returns null when REDIS_URL is unset or ioredis is not installed, so the app
 * keeps working in single-instance / dev mode (callers fall back to in-memory).
 */
import type { Redis } from "ioredis";

let client: Redis | null = null;
let initPromise: Promise<Redis | null> | null = null;
let enabled = !!process.env.REDIS_URL;

export function isRedisEnabled(): boolean {
  return enabled;
}

export async function getRedis(): Promise<Redis | null> {
  if (!enabled) return null;
  if (client) return client;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { default: IORedis } = await import("ioredis");
      const url = process.env.REDIS_URL!;
      const instance = new IORedis(url, {
        // Don't crash the app if Redis is unreachable; degrade gracefully.
        maxRetriesPerRequest: 1,
        lazyConnect: false,
        enableReadyCheck: true,
        retryStrategy: (times) => Math.min(times * 200, 2000),
      });
      instance.on("error", (err) => {
        // Log but don't throw — rate limiter falls back to in-memory.
        console.error("[redis] connection error:", err.message);
      });
      client = instance;
      return instance;
    } catch (err) {
      console.warn(
        "[redis] unavailable (ioredis not installed or connection failed); using in-memory fallback.",
        err instanceof Error ? err.message : String(err)
      );
      enabled = false;
      return null;
    }
  })();

  return initPromise;
}

export default getRedis;
