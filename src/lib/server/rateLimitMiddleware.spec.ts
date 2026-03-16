import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkWriteRateLimit, getClientIP, clearBuckets } from './rateLimit';
import type { RequestEvent } from '@sveltejs/kit';

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    clearBuckets();
  });

  describe('getClientIP', () => {
    it('should get IP from getClientAddress()', () => {
      const event = {
        getClientAddress: () => '203.0.113.1',
        request: { headers: new Headers() }
      } as unknown as RequestEvent;

      const ip = getClientIP(event);
      expect(ip).toBe('203.0.113.1');
    });

    it('should get IP from X-Forwarded-For header', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '203.0.113.2, 10.0.0.1');
      const event = {
        getClientAddress: undefined,
        request: { headers }
      } as unknown as RequestEvent;

      const ip = getClientIP(event);
      expect(ip).toBe('203.0.113.2');
    });

    it('should get IP from X-Real-IP header', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '203.0.113.3');
      const event = {
        getClientAddress: undefined,
        request: { headers }
      } as unknown as RequestEvent;

      const ip = getClientIP(event);
      expect(ip).toBe('203.0.113.3');
    });

    it('should return "unknown" as fallback', () => {
      const event = {
        getClientAddress: undefined,
        request: { headers: new Headers() }
      } as unknown as RequestEvent;

      const ip = getClientIP(event);
      expect(ip).toBe('unknown');
    });
  });

  describe('checkWriteRateLimit', () => {
    it('should allow requests within limit', () => {
      const event = {
        getClientAddress: () => '203.0.113.10',
        request: { headers: new Headers() },
        locals: { user: { id: 'user1' } }
      } as unknown as RequestEvent;

      const result = checkWriteRateLimit(event);
      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it('should return 429 when user limit exceeded', () => {
      const event = {
        getClientAddress: () => '203.0.113.11',
        request: { headers: new Headers() },
        locals: { user: { id: 'user-limit' } }
      } as unknown as RequestEvent;

      // Exhaust user limit
      for (let i = 0; i < 100; i++) {
        checkWriteRateLimit(event);
      }

      const result = checkWriteRateLimit(event);
      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(429);
    });

    it('should include Retry-After header in 429 response', async () => {
      const event = {
        getClientAddress: () => '203.0.113.12',
        request: { headers: new Headers() },
        locals: { user: { id: 'user-retry' } }
      } as unknown as RequestEvent;

      // Exhaust limit
      for (let i = 0; i < 100; i++) {
        checkWriteRateLimit(event);
      }

      const result = checkWriteRateLimit(event);
      const response = result.response as Response;
      expect(response.headers.get('Retry-After')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();

      // Verify JSON body
      const body = (await response.json()) as Record<string, unknown>;
      expect(body.error).toBe('Too Many Requests');
      expect(body.retryAfter).toBeGreaterThan(0);
    });

    it('should whitelist internal IPs', () => {
      const internalEvent = {
        getClientAddress: () => '127.0.0.1',
        request: { headers: new Headers() },
        locals: {}
      } as unknown as RequestEvent;

      // Should allow unlimited requests from localhost
      for (let i = 0; i < 1000; i++) {
        const result = checkWriteRateLimit(internalEvent);
        expect(result.allowed).toBe(true);
      }
    });

    it('should accept custom limits', () => {
      const event = {
        getClientAddress: () => '203.0.113.13',
        request: { headers: new Headers() },
        locals: { user: { id: 'user-custom' } }
      } as unknown as RequestEvent;

      const customConfig = { userLimit: 5, ipLimit: 10 };

      // Exhaust custom limit
      for (let i = 0; i < 5; i++) {
        checkWriteRateLimit(event, customConfig);
      }

      const result = checkWriteRateLimit(event, customConfig);
      expect(result.allowed).toBe(false);
    });

    it('should handle anonymous requests (no user)', () => {
      const event = {
        getClientAddress: () => '203.0.113.14',
        request: { headers: new Headers() },
        locals: {}
      } as unknown as RequestEvent;

      // Should still apply IP limit
      for (let i = 0; i < 300; i++) {
        checkWriteRateLimit(event);
      }

      const result = checkWriteRateLimit(event);
      expect(result.allowed).toBe(false);
    });
  });
});
