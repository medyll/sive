import { describe, it, expect, vi } from 'vitest';

// Mock SvelteKit modules
vi.mock('@sveltejs/kit', () => ({
	redirect: (code: number, url: string) => {
		throw Object.assign(new Error(`redirect ${code} ${url}`), { status: code, location: url });
	},
	fail: (code: number, data: unknown) => ({ status: code, data })
}));

vi.mock('$env/dynamic/private', () => ({
	env: {
		GITHUB_CLIENT_ID: '',
		GITHUB_CLIENT_SECRET: '',
		ORIGIN: 'http://localhost:5173',
		BETTER_AUTH_SECRET: 'test-secret'
	}
}));

vi.mock('$lib/server/auth', () => ({
	auth: { api: { signInEmail: vi.fn(), signInSocial: vi.fn(), signOut: vi.fn(), getSession: vi.fn() } },
	isMock: false
}));

describe('auth page server — hasGithub flag', () => {
	it('returns hasGithub: false when env vars are absent', async () => {
		const { env } = await import('$env/dynamic/private');
		(env as Record<string, string>).GITHUB_CLIENT_ID = '';
		(env as Record<string, string>).GITHUB_CLIENT_SECRET = '';

		const { load } = await import('./+page.server');
		const result = await load({ locals: { user: null } } as Parameters<typeof load>[0]);
		expect((result as { hasGithub: boolean }).hasGithub).toBe(false);
	});

	it('returns hasGithub: true when both env vars are set', async () => {
		const { env } = await import('$env/dynamic/private');
		(env as Record<string, string>).GITHUB_CLIENT_ID = 'fake-id';
		(env as Record<string, string>).GITHUB_CLIENT_SECRET = 'fake-secret';

		// Re-import with updated env (module already loaded, access env directly in load)
		const { load } = await import('./+page.server');
		const result = await load({ locals: { user: null } } as Parameters<typeof load>[0]);
		// env is read at call time so result should reflect current env
		expect((result as { hasGithub: boolean }).hasGithub).toBe(true);

		// Reset
		(env as Record<string, string>).GITHUB_CLIENT_ID = '';
		(env as Record<string, string>).GITHUB_CLIENT_SECRET = '';
	});

	it('returns isMock from server module', async () => {
		const { load } = await import('./+page.server');
		const result = await load({ locals: { user: null } } as Parameters<typeof load>[0]);
		expect((result as { isMock: boolean })).toHaveProperty('isMock');
	});

	it('github action returns fail when isMock', async () => {
		const auth = await import('$lib/server/auth');
		(auth as unknown as { isMock: boolean }).isMock = true;

		const { actions } = await import('./+page.server');
		const result = await (actions as Record<string, () => Promise<unknown>>).github();
		expect((result as { status: number }).status).toBe(503);

		(auth as unknown as { isMock: boolean }).isMock = false;
	});
});
