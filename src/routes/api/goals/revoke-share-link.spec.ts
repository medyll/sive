import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './revoke-share-link/+server';
import * as goalSharing from '$lib/server/goalSharing';

// Mock modules
vi.mock('$lib/server/rateLimitMiddleware', () => ({
	checkWriteRateLimit: vi.fn().mockResolvedValue({ allowed: true })
}));

describe('POST /api/goals/revoke-share-link', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return 401 if user not authenticated', async () => {
		const event = {
			locals: { user: null },
			request: {
				json: vi.fn().mockResolvedValue({ token: 'abc123' })
			}
		} as any;

		const response = await POST(event);
		const body = await response.json();

		expect(response.status).toBe(401);
		expect(body.error).toBe('Unauthorized');
	});

	it('should return 400 if token not provided', async () => {
		const event = {
			locals: { user: { id: 'user-123' } },
			request: {
				json: vi.fn().mockResolvedValue({})
			}
		} as any;

		const response = await POST(event);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.error).toBe('token required');
	});

	it('should return 404 if token not found', async () => {
		const event = {
			locals: { user: { id: 'user-123' } },
			request: {
				json: vi.fn().mockResolvedValue({ token: 'invalid-token' })
			}
		} as any;

		const response = await POST(event);
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body.error).toBe('Not found or not yours');
	});

	it('should revoke a valid share link', async () => {
		// First create a link
		const link = goalSharing.createGoalShareLink('user-123');

		const event = {
			locals: { user: { id: 'user-123' } },
			request: {
				json: vi.fn().mockResolvedValue({ token: link.token })
			}
		} as any;

		const response = await POST(event);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.ok).toBe(true);

		// Verify link is revoked
		const resolved = goalSharing.resolveGoalShareLink(link.token);
		expect(resolved).toBeNull();
	});

	it('should not allow revoking someone elses link', async () => {
		// Create a link for user-123
		const link = goalSharing.createGoalShareLink('user-123');

		// Try to revoke it as user-456
		const event = {
			locals: { user: { id: 'user-456' } },
			request: {
				json: vi.fn().mockResolvedValue({ token: link.token })
			}
		} as any;

		const response = await POST(event);
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body.error).toBe('Not found or not yours');

		// Verify link is still active
		const resolved = goalSharing.resolveGoalShareLink(link.token);
		expect(resolved).not.toBeNull();
	});
});
