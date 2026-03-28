import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './create-share-link/+server';
import * as goalSharing from '$lib/server/goalSharing';
import type { RequestHandler } from './$types';

// Mock modules
vi.mock('$lib/server/rateLimitMiddleware', () => ({
	checkWriteRateLimit: vi.fn().mockResolvedValue({ allowed: true })
}));

describe('POST /api/goals/create-share-link', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return 401 if user not authenticated', async () => {
		const event = {
			locals: { user: null },
			request: { json: vi.fn() }
		} as any;

		const response = await POST(event);
		const body = await response.json();

		expect(response.status).toBe(401);
		expect(body.error).toBe('Unauthorized');
	});

	it('should create a share link for authenticated user', async () => {
		const event = {
			locals: { user: { id: 'user-123' } },
			request: { json: vi.fn() }
		} as any;

		const response = await POST(event);
		const body = await response.json();

		expect(response.status).toBe(201);
		expect(body.token).toBeDefined();
		expect(body.url).toMatch(/^\/goals\//);
		expect(body.expiresAt).toBeDefined();
	});

	it('should generate unique tokens', async () => {
		const event = {
			locals: { user: { id: 'user-123' } },
			request: { json: vi.fn() }
		} as any;

		const response1 = await POST(event);
		const body1 = await response1.json();

		const response2 = await POST(event);
		const body2 = await response2.json();

		expect(body1.token).not.toBe(body2.token);
	});

	it('should set expiry to 30 days from now', async () => {
		const event = {
			locals: { user: { id: 'user-123' } },
			request: { json: vi.fn() }
		} as any;

		const now = new Date();
		const response = await POST(event);
		const body = await response.json();

		const expiryDate = new Date(body.expiresAt);
		const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

		// Should be approximately 30 days (with 2-day tolerance for execution time)
		expect(daysUntilExpiry).toBeGreaterThanOrEqual(28);
		expect(daysUntilExpiry).toBeLessThanOrEqual(31);
	});
});
