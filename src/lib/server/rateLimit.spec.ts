import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getRateLimitHeaders,
  clearBuckets,
  getBucketStats
} from './rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    clearBuckets();
  });

  describe('token bucket algorithm', () => {
    it('should allow requests within user limit', () => {
      for (let i = 0; i < 100; i++) {
        const result = checkRateLimit('user123', '203.0.113.50');
        expect(result.allowed).toBe(true);
      }

      // 101st request should fail
      const result = checkRateLimit('user123', '203.0.113.50');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should allow requests within IP limit', () => {
      for (let i = 0; i < 150; i++) {
        const result = checkRateLimit(null, '203.0.113.50');
        expect(result.allowed).toBe(true);
      }

      // 151st request should fail
      const result = checkRateLimit(null, '203.0.113.50');
      expect(result.allowed).toBe(false);
    });

    it('should respect IP limit even with different users', () => {
      // 150 requests from 2 different users on same IP
      for (let i = 0; i < 150; i++) {
        const userId = i % 2 === 0 ? 'user1' : 'user2';
        const result = checkRateLimit(userId, '203.0.113.51');
        expect(result.allowed).toBe(true);
      }

      // 151st request should fail (300 IP limit reached)
      const result = checkRateLimit('user3', '203.0.113.51');
      expect(result.allowed).toBe(false);
    });

    it('should apply stricter of user or IP limit', () => {
      const ip = '203.0.113.52';

      // Fill user bucket to 100
      for (let i = 0; i < 100; i++) {
        checkRateLimit('user-strict', ip);
      }

      // User limit exhausted, even though IP has capacity
      const result = checkRateLimit('user-strict', ip);
      expect(result.allowed).toBe(false);
    });
  });

  describe('whitelist & internal IPs', () => {
    it('should whitelist localhost', () => {
      for (let i = 0; i < 1000; i++) {
        const result = checkRateLimit('user', '127.0.0.1');
        expect(result.allowed).toBe(true);
      }
    });

    it('should whitelist ::1 (IPv6 localhost)', () => {
      for (let i = 0; i < 1000; i++) {
        const result = checkRateLimit('user', '::1');
        expect(result.allowed).toBe(true);
      }
    });

    it('should whitelist private IP ranges', () => {
      const privateIPs = ['192.168.1.1', '10.0.0.1', '172.16.0.1'];

      privateIPs.forEach((ip) => {
        clearBuckets();
        for (let i = 0; i < 1000; i++) {
          const result = checkRateLimit('user', ip);
          expect(result.allowed).toBe(true);
        }
      });
    });

    it('should NOT whitelist public IPs', () => {
      const result = checkRateLimit('user', '8.8.8.8');
      for (let i = 0; i < 100; i++) {
        checkRateLimit('user', '8.8.8.8');
      }
      const limited = checkRateLimit('user', '8.8.8.8');
      expect(limited.allowed).toBe(false);
    });
  });

  describe('retry-after header', () => {
    it('should return retry-after on limit exceeded', () => {
      // Exhaust user limit
      for (let i = 0; i < 100; i++) {
        checkRateLimit('user-retry', '203.0.113.100');
      }

      const result = checkRateLimit('user-retry', '203.0.113.100');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60); // Should be <= 1 min
    });

    it('should generate correct retry-after headers', () => {
      const headers = getRateLimitHeaders(30);
      expect(headers['Retry-After']).toBe('30');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('should not return headers when allowed', () => {
      const headers = getRateLimitHeaders(0);
      expect(Object.keys(headers).length).toBe(0);
    });
  });

  describe('token refill', () => {
    it('should refill tokens after timeout', async () => {
      const userLimit = 10;
      const config = { userLimit, refillInterval: 100 }; // 100ms refill

      // Exhaust tokens
      for (let i = 0; i < userLimit; i++) {
        checkRateLimit('user-refill', '203.0.113.101', config);
      }

      // Should be limited
      let result = checkRateLimit('user-refill', '203.0.113.101', config);
      expect(result.allowed).toBe(false);

      // Wait for refill
      await new Promise((resolve) => setTimeout(resolve, 110));

      // Should be allowed again
      result = checkRateLimit('user-refill', '203.0.113.101', config);
      expect(result.allowed).toBe(true);
    });
  });

  describe('custom config', () => {
    it('should accept custom limits', () => {
      const config = { userLimit: 5, ipLimit: 10 };

      // User limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit('user-custom', '203.0.113.102', config);
      }
      let result = checkRateLimit('user-custom', '203.0.113.102', config);
      expect(result.allowed).toBe(false);

      clearBuckets();

      // IP limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit(null, '203.0.113.103', config);
      }
      result = checkRateLimit(null, '203.0.113.103', config);
      expect(result.allowed).toBe(false);
    });
  });

  describe('bucket stats', () => {
    it('should track bucket statistics', () => {
      checkRateLimit('user-stats', '203.0.113.104');
      checkRateLimit('user-stats2', '203.0.113.104');
      checkRateLimit(null, '203.0.113.105');

      const stats = getBucketStats();
      expect(Object.keys(stats.userBuckets).length).toBe(2);
      expect(Object.keys(stats.ipBuckets).length).toBe(2);
    });
  });
});
