/**
 * Rate Limiting Utility for Next.js API Routes
 *
 * Provides in-memory rate limiting using a sliding window approach.
 * Suitable for single-instance deployments. For multi-instance setups,
 * consider @upstash/ratelimit with Redis.
 *
 * @example
 * ```ts
 * import { rateLimit } from '@elzatona/utilities';
 *
 * const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
 *
 * export async function POST(request: NextRequest) {
 *   const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
 *   const { success } = await limiter.check(10, ip); // 10 requests per minute
 *   if (!success) {
 *     return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 *   }
 *   // ... handle request
 * }
 * ```
 */

interface RateLimitOptions {
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  interval?: number;
  /** Max unique tokens (IPs) to track per interval (default: 500) */
  uniqueTokenPerInterval?: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** Unix timestamp when the rate limit resets */
  reset: number;
}

interface TokenBucket {
  count: number;
  resetTime: number;
}

/**
 * Create a rate limiter instance with configurable window and capacity.
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const { interval = 60_000, uniqueTokenPerInterval = 500 } = options;

  const tokenBuckets = new Map<string, TokenBucket>();

  // Periodic cleanup to prevent memory leaks
  const cleanup = () => {
    const now = Date.now();
    if (tokenBuckets.size <= uniqueTokenPerInterval) return;

    // Phase 1: Evict expired buckets
    _evictExpired(tokenBuckets, now);

    // Phase 2: If still over limit, evict oldest by reset time
    if (tokenBuckets.size > uniqueTokenPerInterval) {
      _evictOldest(tokenBuckets, uniqueTokenPerInterval);
    }
  };

  return {
    /**
     * Check if a request from the given token (usually IP) is within the rate limit.
     * @param limit - Maximum number of requests allowed per interval
     * @param token - Unique identifier for the client (e.g., IP address)
     */
    check(limit: number, token: string): Promise<RateLimitResult> {
      return new Promise((resolve) => {
        const now = Date.now();
        const resetTime = now + interval;

        const bucket = tokenBuckets.get(token);

        if (!bucket || now > bucket.resetTime) {
          // New window — reset counter
          tokenBuckets.set(token, { count: 1, resetTime });
          cleanup();
          resolve({ success: true, remaining: limit - 1, reset: resetTime });
        } else if (bucket.count < limit) {
          // Within limit — increment
          bucket.count++;
          resolve({
            success: true,
            remaining: limit - bucket.count,
            reset: bucket.resetTime,
          });
        } else {
          // Rate limit exceeded
          resolve({
            success: false,
            remaining: 0,
            reset: bucket.resetTime,
          });
        }
      });
    },

    /** Reset the rate limiter (useful for testing) */
    reset() {
      tokenBuckets.clear();
    },
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Evict expired buckets from the map.
 */
function _evictExpired(buckets: Map<string, TokenBucket>, now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetTime) {
      buckets.delete(key);
    }
  }
}

/**
 * Evict oldest buckets to stay within capacity.
 */
function _evictOldest(buckets: Map<string, TokenBucket>, capacity: number) {
  const entries = Array.from(buckets.entries());
  entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
  const toRemove = entries.slice(0, entries.length - capacity);
  for (const [key] of toRemove) {
    buckets.delete(key);
  }
}

/** Auth endpoints: 10 requests per minute per IP */
export const authRateLimiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
});

/** General API: 100 requests per minute per IP */
export const apiRateLimiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 1000,
});

/** Strict limiter for sensitive operations: 5 requests per minute per IP */
export const strictRateLimiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 200,
});
