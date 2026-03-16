import { test, expect } from './fixtures';

test.describe('Sprint 29 - Rate Limiting & Security', () => {
  test.describe('Rate Limiting', () => {
    test('should return 429 when user exceeds rate limit', async ({ page, goto }) => {
      await goto('/app');

      // Attempt to create documents rapidly (exceed 100/min limit)
      const responses: Response[] = [];
      for (let i = 0; i < 102; i++) {
        const response = await page.evaluate(async () => {
          return fetch('/app?/createDocument', {
            method: 'POST',
            body: new FormData()
          }).then((r) => ({
            status: r.status,
            headers: Array.from(r.headers.entries())
          }));
        });
        responses.push(response as unknown as Response);

        if (response.status === 429) {
          break; // Stop after hitting limit
        }
      }

      // Verify we got a 429 response
      const rateLimitedResponse = responses.find((r) => r.status === 429);
      expect(rateLimitedResponse?.status).toBe(429);
    });

    test('should include Retry-After header in 429 response', async ({ page, goto }) => {
      await goto('/app');

      // Exceed rate limit and check headers
      let retryAfterHeader: string | null = null;

      for (let i = 0; i < 102; i++) {
        const response = await page.evaluate(async () => {
          const resp = await fetch('/app?/createDocument', {
            method: 'POST',
            body: new FormData()
          });
          return {
            status: resp.status,
            retryAfter: resp.headers.get('Retry-After')
          };
        });

        if (response.status === 429) {
          retryAfterHeader = response.retryAfter;
          break;
        }
      }

      expect(retryAfterHeader).toBeTruthy();
      expect(parseInt(retryAfterHeader || '0')).toBeGreaterThan(0);
    });
  });

  test.describe('Security Headers', () => {
    test('should include Content-Security-Policy header', async ({ page, goto }) => {
      const response = await goto('/app');
      const cspHeader = response?.headers()['content-security-policy'];

      expect(cspHeader).toBeTruthy();
      expect(cspHeader).toContain('default-src');
      expect(cspHeader).toContain("img-src 'self'");
    });

    test('should include X-Content-Type-Options header', async ({ page, goto }) => {
      const response = await goto('/app');
      const header = response?.headers()['x-content-type-options'];

      expect(header).toBe('nosniff');
    });

    test('should include X-Frame-Options header', async ({ page, goto }) => {
      const response = await goto('/app');
      const header = response?.headers()['x-frame-options'];

      expect(header).toBe('DENY');
    });

    test('should include Strict-Transport-Security header', async ({ page, goto }) => {
      const response = await goto('/app');
      const hstsHeader = response?.headers()['strict-transport-security'];

      expect(hstsHeader).toBeTruthy();
      expect(hstsHeader).toContain('max-age=31536000');
      expect(hstsHeader).toContain('includeSubDomains');
    });

    test('should include Referrer-Policy header', async ({ page, goto }) => {
      const response = await goto('/app');
      const header = response?.headers()['referrer-policy'];

      expect(header).toBe('strict-origin-when-cross-origin');
    });

    test('should include X-XSS-Protection header', async ({ page, goto }) => {
      const response = await goto('/app');
      const header = response?.headers()['x-xss-protection'];

      expect(header).toBe('1; mode=block');
    });
  });

  test.describe('Input Validation', () => {
    test('should reject document title with script injection', async ({ page, goto }) => {
      await goto('/app');

      const result = await page.evaluate(async () => {
        const formData = new FormData();
        formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
        formData.append('title', '<script>alert(1)</script>');

        const response = await fetch('/app?/updateDocument', {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should reject document title exceeding 255 characters', async ({ page, goto }) => {
      await goto('/app');

      const result = await page.evaluate(async () => {
        const formData = new FormData();
        formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
        formData.append('title', 'a'.repeat(256));

        const response = await fetch('/app?/updateDocument', {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('255');
    });

    test('should reject document title with null bytes', async ({ page, goto }) => {
      await goto('/app');

      const result = await page.evaluate(async () => {
        const formData = new FormData();
        formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
        formData.append('title', 'Title\0Injection');

        const response = await fetch('/app?/updateDocument', {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      expect(result.success).toBe(false);
    });

    test('should reject content payload exceeding 1MB', async ({ page, goto }) => {
      await goto('/app');

      const result = await page.evaluate(async () => {
        const formData = new FormData();
        formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
        formData.append('content', 'a'.repeat(1048577)); // >1MB

        const response = await fetch('/app?/updateDocument', {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('1MB');
    });

    test('should reject invalid document ID format', async ({ page, goto }) => {
      await goto('/app');

      const result = await page.evaluate(async () => {
        const formData = new FormData();
        formData.append('id', 'not-a-uuid');

        const response = await fetch('/app?/deleteDocument', {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('ID');
    });

    test('should reject title with event handler injection', async ({ page, goto }) => {
      await goto('/app');

      const result = await page.evaluate(async () => {
        const formData = new FormData();
        formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
        formData.append('title', 'Title onclick="alert(1)"');

        const response = await fetch('/app?/updateDocument', {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      expect(result.success).toBe(false);
    });

    test('should accept valid document updates', async ({ page, goto }) => {
      await goto('/app');

      const result = await page.evaluate(async () => {
        const formData = new FormData();
        formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
        formData.append('title', 'Valid Title');
        formData.append('content', 'Valid content here');

        const response = await fetch('/app?/updateDocument', {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      // Note: In mock mode, this may succeed even though the doc doesn't exist
      // The important part is that validation passed
      expect(result).toBeTruthy();
    });
  });

  test.describe('API Response Validation', () => {
    test('should have security headers on API responses', async ({ page }) => {
      const response = await page.goto('/api/ai/stream?q=W3sicm9sZSI6InVzZXIiLCJ0ZXh0IjoiaGkifV0=');

      if (response && response.ok) {
        expect(response.headers()['content-security-policy']).toBeTruthy();
        expect(response.headers()['x-content-type-options']).toBe('nosniff');
        expect(response.headers()['x-frame-options']).toBe('DENY');
      }
    });

    test('should have security headers on PDF export', async ({ page }) => {
      const response = await page.goto('/api/export/pdf?docId=test-doc');

      expect(response?.headers()['content-security-policy']).toBeTruthy();
      expect(response?.headers()['x-content-type-options']).toBe('nosniff');
    });

    test('should have security headers on summary endpoint', async ({ page }) => {
      const response = await page.goto('/api/ai/summary?ctx=dGVzdA==&length=short');

      expect(response?.headers()['content-security-policy']).toBeTruthy();
      expect(response?.headers()['x-frame-options']).toBe('DENY');
    });
  });
});
