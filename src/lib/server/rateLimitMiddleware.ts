/**
 * SvelteKit middleware helper for rate limiting
 * Integrates with checkRateLimit from rateLimit.ts
 */

import { json, type RequestEvent } from '@sveltejs/kit';
import { checkRateLimit, getRateLimitHeaders } from './rateLimit';

export interface RateLimitOptions {
  userLimit?: number;
  ipLimit?: number;
}

/**
 * Extract client IP from SvelteKit event
 */
export function getClientIP(event: RequestEvent): string {
  // Try getClientAddress() first (SvelteKit built-in)
  const clientAddr = event.getClientAddress?.();
  if (clientAddr) return clientAddr;

  // Fallback to X-Forwarded-For header (from reverse proxy)
  if (event.request?.headers) {
    const forwarded = event.request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();

    // Fallback to X-Real-IP
    const realIp = event.request.headers.get('x-real-ip');
    if (realIp) return realIp;
  }

  // Last resort: unknown
  return 'unknown';
}

/**
 * Check rate limit and return 429 if exceeded
 */
export function checkWriteRateLimit(
  event: RequestEvent,
  options?: RateLimitOptions
): {
  allowed: boolean;
  response?: Response;
} {
  const userId = event.locals?.user?.id ?? null;
  const ip = getClientIP(event);

  const result = checkRateLimit(userId, ip, options);

  if (!result.allowed) {
    const headers = getRateLimitHeaders(result.retryAfter);
    return {
      allowed: false,
      response: json(
        {
          error: 'Too Many Requests',
          retryAfter: result.retryAfter,
          message: `Rate limit exceeded. Please retry in ${result.retryAfter} second(s).`
        },
        {
          status: 429,
          headers
        }
      )
    };
  }

  return { allowed: true };
}

/**
 * Wrap a SvelteKit form action with rate limiting
 */
export function withRateLimit<T extends Record<string, unknown>>(
  action: (opts: { request: Request; locals: App.Locals; [key: string]: unknown }) => Promise<T>,
  options?: RateLimitOptions
) {
  return async (event: RequestEvent): Promise<T | Response> => {
    const limit = checkWriteRateLimit(event, options);
    if (!limit.allowed) {
      return limit.response!;
    }
    return action({
      request: event.request,
      locals: event.locals
    } as Parameters<typeof action>[0]);
  };
}
