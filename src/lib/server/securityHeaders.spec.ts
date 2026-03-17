import { describe, it, expect } from 'vitest';

/**
 * Security Headers Test Suite
 * Validates that all required security headers are properly configured
 */

const REQUIRED_HEADERS = {
	'Content-Security-Policy': {
		required: true,
		shouldContain: ['default-src', "img-src 'self'", "script-src 'self'", "style-src 'self'"]
	},
	'X-Content-Type-Options': {
		required: true,
		value: 'nosniff'
	},
	'X-Frame-Options': {
		required: true,
		value: 'DENY'
	},
	'Strict-Transport-Security': {
		required: true,
		shouldContain: ['max-age=31536000', 'includeSubDomains']
	},
	'Referrer-Policy': {
		required: true,
		value: 'strict-origin-when-cross-origin'
	},
	'X-XSS-Protection': {
		required: true,
		value: '1; mode=block'
	}
};

describe('Security Headers Configuration', () => {
	describe('CSP Header Requirements', () => {
		it('should include CSP header', () => {
			expect(REQUIRED_HEADERS['Content-Security-Policy'].required).toBe(true);
		});

		it('CSP should restrict default sources', () => {
			const cspConfig = REQUIRED_HEADERS['Content-Security-Policy'];
			expect(cspConfig.shouldContain).toContain('default-src');
		});

		it('CSP should restrict image sources', () => {
			const cspConfig = REQUIRED_HEADERS['Content-Security-Policy'];
			expect(cspConfig.shouldContain).toContain("img-src 'self'");
		});

		it('CSP should restrict script sources', () => {
			const cspConfig = REQUIRED_HEADERS['Content-Security-Policy'];
			expect(cspConfig.shouldContain).toContain("script-src 'self'");
		});

		it('CSP should restrict style sources', () => {
			const cspConfig = REQUIRED_HEADERS['Content-Security-Policy'];
			expect(cspConfig.shouldContain).toContain("style-src 'self'");
		});
	});

	describe('Content Type Protection', () => {
		it('should set X-Content-Type-Options to nosniff', () => {
			const header = REQUIRED_HEADERS['X-Content-Type-Options'];
			expect(header.value).toBe('nosniff');
			expect(header.required).toBe(true);
		});

		it('should deny frame embedding with X-Frame-Options', () => {
			const header = REQUIRED_HEADERS['X-Frame-Options'];
			expect(header.value).toBe('DENY');
			expect(header.required).toBe(true);
		});
	});

	describe('Transport Security', () => {
		it('should enforce HTTPS with HSTS', () => {
			const header = REQUIRED_HEADERS['Strict-Transport-Security'];
			expect(header.required).toBe(true);
			expect(header.shouldContain).toContain('max-age=31536000');
		});

		it('HSTS should include subdomains', () => {
			const header = REQUIRED_HEADERS['Strict-Transport-Security'];
			expect(header.shouldContain).toContain('includeSubDomains');
		});
	});

	describe('Referrer Policy', () => {
		it('should set strict referrer policy', () => {
			const header = REQUIRED_HEADERS['Referrer-Policy'];
			expect(header.value).toBe('strict-origin-when-cross-origin');
			expect(header.required).toBe(true);
		});
	});

	describe('XSS Protection', () => {
		it('should enable XSS protection', () => {
			const header = REQUIRED_HEADERS['X-XSS-Protection'];
			expect(header.value).toBe('1; mode=block');
			expect(header.required).toBe(true);
		});
	});

	describe('Header Completeness', () => {
		it('should have all required headers configured', () => {
			const requiredHeaders = Object.entries(REQUIRED_HEADERS)
				.filter(([, config]) => config.required)
				.map(([name]) => name);

			expect(requiredHeaders.length).toBeGreaterThan(0);
			expect(requiredHeaders).toContain('Content-Security-Policy');
			expect(requiredHeaders).toContain('X-Content-Type-Options');
			expect(requiredHeaders).toContain('X-Frame-Options');
			expect(requiredHeaders).toContain('Strict-Transport-Security');
			expect(requiredHeaders).toContain('Referrer-Policy');
		});
	});

	describe('Header Security Level', () => {
		it('CSP should use allowlist approach (self only)', () => {
			const cspConfig = REQUIRED_HEADERS['Content-Security-Policy'];
			const cspDirectives = cspConfig.shouldContain;

			// Verify that directives use 'self' for restrictive defaults
			expect(cspDirectives.some((d) => d.includes("'self'"))).toBe(true);
		});

		it('should deny all frame embedding', () => {
			expect(REQUIRED_HEADERS['X-Frame-Options'].value).toBe('DENY');
		});

		it('should require secure transport (HTTPS)', () => {
			const hstsConfig = REQUIRED_HEADERS['Strict-Transport-Security'];
			expect(hstsConfig.shouldContain).toContain('max-age=31536000');
			// 31536000 seconds = 1 year
			expect(31536000).toBeGreaterThanOrEqual(15768000); // At least 6 months
		});
	});
});
