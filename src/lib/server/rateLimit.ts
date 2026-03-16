/**
 * Rate limiting middleware using token bucket algorithm
 * Per-user: 100 req/min | Per-IP: 300 req/min
 * Whitelist: localhost, 127.0.0.1, internal IPs
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  userLimit: number; // tokens per minute
  ipLimit: number; // tokens per minute
  refillInterval: number; // milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  userLimit: 100,
  ipLimit: 300,
  refillInterval: 60000 // 1 minute
};

const WHITELIST_IPS = new Set([
  '127.0.0.1',
  '::1',
  'localhost',
  '0.0.0.0'
]);

const INTERNAL_IP_REGEX = /^(127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|::1|fe80::)/;

// In-memory storage: userId -> TokenBucket, ip -> TokenBucket
const userBuckets = new Map<string, TokenBucket>();
const ipBuckets = new Map<string, TokenBucket>();

function isInternalIP(ip: string): boolean {
  if (WHITELIST_IPS.has(ip)) return true;
  return INTERNAL_IP_REGEX.test(ip);
}

function refillBucket(bucket: TokenBucket, limit: number, interval: number): TokenBucket {
  const now = Date.now();
  const timePassed = now - bucket.lastRefill;
  const refillCount = Math.floor(timePassed / interval);

  if (refillCount > 0) {
    bucket.tokens = Math.min(limit, bucket.tokens + refillCount * limit);
    bucket.lastRefill = now - (timePassed % interval);
  }

  return bucket;
}

function createBucket(limit: number): TokenBucket {
  return {
    tokens: limit,
    lastRefill: Date.now()
  };
}

function consumeToken(
  bucket: TokenBucket,
  limit: number,
  interval: number
): { allowed: boolean; retryAfter: number } {
  refillBucket(bucket, limit, interval);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfter: 0 };
  }

  // Calculate time until next token available
  const nextRefillTime = bucket.lastRefill + interval;
  const retryAfter = Math.ceil((nextRefillTime - Date.now()) / 1000);

  return { allowed: false, retryAfter: Math.max(1, retryAfter) };
}

export function checkRateLimit(
  userId: string | null,
  ip: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; retryAfter: number } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Skip rate limiting for internal IPs
  if (isInternalIP(ip)) {
    return { allowed: true, retryAfter: 0 };
  }

  // Check per-IP limit (always enforced)
  let ipBucket = ipBuckets.get(ip);
  if (!ipBucket) {
    ipBucket = createBucket(finalConfig.ipLimit);
    ipBuckets.set(ip, ipBucket);
  }

  const ipResult = consumeToken(ipBucket, finalConfig.ipLimit, finalConfig.refillInterval);
  if (!ipResult.allowed) {
    return ipResult;
  }

  // Check per-user limit (if userId provided)
  if (userId) {
    let userBucket = userBuckets.get(userId);
    if (!userBucket) {
      userBucket = createBucket(finalConfig.userLimit);
      userBuckets.set(userId, userBucket);
    }

    const userResult = consumeToken(userBucket, finalConfig.userLimit, finalConfig.refillInterval);
    if (!userResult.allowed) {
      return userResult;
    }
  }

  return { allowed: true, retryAfter: 0 };
}

export function getRateLimitHeaders(retryAfter: number): Record<string, string> {
  if (retryAfter === 0) {
    return {};
  }

  return {
    'Retry-After': retryAfter.toString(),
    'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString()
  };
}

/**
 * Clear all buckets (useful for testing)
 */
export function clearBuckets(): void {
  userBuckets.clear();
  ipBuckets.clear();
}

/**
 * Get bucket statistics (for monitoring/testing)
 */
export function getBucketStats() {
  return {
    userBuckets: Object.fromEntries(userBuckets),
    ipBuckets: Object.fromEntries(ipBuckets)
  };
}
