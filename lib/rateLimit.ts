/** @format */

/**
 * Simple in-memory rate limiter for DSAR endpoints
 * Tracks requests by IP + userId combination
 * No external dependencies, suitable for edge runtime
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store: key = "ip:userId", value = { count, resetAt }
const store = new Map<string, RateLimitEntry>();

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  // DSAR endpoints: 5 requests per 10 minutes
  dsar: {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
  // General API: 100 requests per minute
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Cleanup old entries from store
 */
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  const keysToDelete: string[] = [];
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => store.delete(key));
  lastCleanup = now;
}

/**
 * Rate limit check
 * @param identifier - Unique identifier (e.g., "ip:userId" or just "ip")
 * @param type - Rate limit type ('dsar' or 'api')
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  type: "dsar" | "api" = "api"
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  cleanup();

  const config = RATE_LIMIT_CONFIG[type];
  const now = Date.now();
  const entry = store.get(identifier);

  // No entry or window expired - allow and create new entry
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(identifier, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Entry exists and window is still active
  if (entry.count < config.maxRequests) {
    entry.count++;
    store.set(identifier, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000), // seconds
  };
}

/**
 * Get client IP from request headers
 * Works with Vercel and other common proxies
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a default (not ideal but prevents crashes)
  return "unknown";
}

/**
 * Create rate limit identifier for DSAR endpoints
 * Combines IP and userId for more granular control
 */
export function createDsarIdentifier(ip: string, userId: string): string {
  return `dsar:${ip}:${userId}`;
}

/**
 * Helper to create rate limit error response
 */
export function rateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: "Çok fazla istek gönderildi",
      message: `Lütfen ${retryAfter} saniye sonra tekrar deneyin`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

