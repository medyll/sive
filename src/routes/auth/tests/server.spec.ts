import { describe, it, expect, vi, beforeEach } from 'vitest';

// mockAuth must be prefixed with "mock" so vitest allows it inside vi.mock factory
const mockAuth = {
	api: {
		signInEmail: vi.fn()
	}
};

vi.mock('$lib/server/auth', () => ({ auth: mockAuth }));

// Import after mock is registered
const { POST } = await import('../+server');

function makeRequest(body: Record<string, unknown>): Request {
	return new Request('http://localhost/auth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

describe('POST /auth handler', () => {
	beforeEach(() => {
		// Reset to a functioning mock before each test
		mockAuth.api.signInEmail = vi.fn().mockResolvedValue({ user: { id: '1' } });
	});

	// --- Validation ---

	it('returns 400 when email is missing', async () => {
		const res = await POST({ request: makeRequest({ password: 'secret' }) } as any);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ message: 'Missing credentials' });
	});

	it('returns 400 when password is missing', async () => {
		const res = await POST({ request: makeRequest({ email: 'user@example.com' }) } as any);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ message: 'Missing credentials' });
	});

	it('returns 400 when both email and password are missing', async () => {
		const res = await POST({ request: makeRequest({}) } as any);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ message: 'Missing credentials' });
	});

	// --- Auth unavailability ---

	it('returns 503 when auth.api.signInEmail is not available', async () => {
		(mockAuth.api as any).signInEmail = undefined;
		const res = await POST({
			request: makeRequest({ email: 'user@example.com', password: 'secret' })
		} as any);
		expect(res.status).toBe(503);
		expect(await res.json()).toMatchObject({ message: 'Auth unavailable' });
	});

	// --- Success path ---

	it('returns 200 with ok:true on successful sign-in', async () => {
		const res = await POST({
			request: makeRequest({ email: 'user@example.com', password: 'correct' })
		} as any);
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ ok: true });
	});

	it('calls signInEmail with the provided credentials', async () => {
		await POST({
			request: makeRequest({ email: 'admin@test.com', password: 'pass123' })
		} as any);
		expect(mockAuth.api.signInEmail).toHaveBeenCalledExactlyOnceWith({
			email: 'admin@test.com',
			password: 'pass123'
		});
	});

	// --- Error path ---

	it('returns 401 with error message when sign-in throws', async () => {
		mockAuth.api.signInEmail = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
		const res = await POST({
			request: makeRequest({ email: 'user@example.com', password: 'wrong' })
		} as any);
		expect(res.status).toBe(401);
		expect(await res.json()).toMatchObject({ message: 'Invalid credentials' });
	});

	it('returns 401 with fallback message when thrown error has no message', async () => {
		mockAuth.api.signInEmail = vi.fn().mockRejectedValue({});
		const res = await POST({
			request: makeRequest({ email: 'user@example.com', password: 'wrong' })
		} as any);
		expect(res.status).toBe(401);
		expect(await res.json()).toMatchObject({ message: 'Sign-in failed' });
	});
});
