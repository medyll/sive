import { describe, it, expect, vi } from 'vitest';

// Override isMock=false for guard tests
vi.mock('$lib/server/db', () => ({
	db: null,
	isMock: false
}));

vi.mock('$lib/server/db/schema', () => ({
	documents: {}
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn()
}));

const { load } = await import('./+page.server.ts');

describe('+page.server.ts — route guard (non-mock mode)', () => {
	it('redirects to /auth when no user and isMock=false', async () => {
		await expect(
			load({ locals: {} } as Parameters<typeof load>[0])
		).rejects.toMatchObject({ location: '/auth', status: 302 });
	});

	it('does not redirect when user is present', async () => {
		const user = { id: 'u1', name: 'Bob', email: 'bob@example.com' };
		// When db is null it returns stub docs; we just need no redirect
		const result = await load({ locals: { user } } as Parameters<typeof load>[0]);
		expect(result).toBeDefined();
	});
});
