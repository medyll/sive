import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import type { BetterAuth } from 'better-auth/minimal';

// Attempt to initialize real Better-Auth when DB and adapter are available.
// If not (e.g., better-sqlite3 native binding missing), export a lightweight stub
// that preserves the same shape (`auth.api.*`) but operates in degraded mode.

let auth: any = null;
let isMock = false;

try {
	// dynamic imports to avoid throwing when native bindings fail earlier
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { betterAuth } = require('better-auth/minimal');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { drizzleAdapter } = require('better-auth/adapters/drizzle');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { sveltekitCookies } = require('better-auth/svelte-kit');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { db, isMock: dbIsMock } = require('./db');

	if (dbIsMock) throw new Error('DB unavailable, skipping real auth initialization');

	auth = betterAuth({
		baseURL: env.ORIGIN,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, { provider: 'sqlite' }),
		emailAndPassword: { enabled: true },
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET
			}
		},
		plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
	});
} catch (err) {
	// fallback stub
	// eslint-disable-next-line no-console
	console.warn('better-auth init failed; using auth stub for dev:', err?.message || err);
	isMock = true;

	auth = {
		isMock: true,
		api: {
			// minimal implementations used by hooks/routes: return null or throw informative errors
			getSession: async () => null,
			signInEmail: async () => { throw new Error('Auth unavailable in dev stub'); },
			signUpEmail: async () => { throw new Error('Auth unavailable in dev stub'); },
			signInSocial: async () => ({ url: undefined }),
			signOut: async () => ({}),
		}
	};
}

export { auth, isMock };
