import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	auth: { api: { signOut: vi.fn() } },
	isMock: true
}));

const { load } = await import('./+page.server.ts');

describe('profile +page.server.ts', () => {
	it('returns user data when user is present (mock mode)', async () => {
		const user = { id: 'u1', name: 'Alice', email: 'alice@example.com' };
		const result = await load({ locals: { user } } as Parameters<typeof load>[0]);
		expect(result.user).toEqual(user);
		expect(result.isMock).toBe(true);
	});

	it('returns user=null when no user in mock mode (guest)', async () => {
		const result = await load({ locals: {} } as Parameters<typeof load>[0]);
		expect(result.user).toBeNull();
	});
});
