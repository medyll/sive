import type { Handle } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth, isMock } from '$lib/server/auth';
import { db as drizzleDb } from '$lib/server/db';
import { user_preferences } from '$lib/server/db/schema';
import { shouldDenyApiRequest } from '$lib/server/apiGuard';
import { eq } from 'drizzle-orm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let svelteKitHandler: any;
try {
	// import only when available
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	svelteKitHandler = require('better-auth/svelte-kit').svelteKitHandler;
} catch (e) {
	svelteKitHandler = null;
}

const SECURITY_HEADERS = {
	'Content-Security-Policy':
		// 'unsafe-eval' removed: nothing in the app needs runtime code evaluation.
		// 'unsafe-inline' is still required by SvelteKit's inlined hydration data
		// and by the components that carry inline styles; removing it needs
		// per-request nonces and is tracked separately.
		"default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-XSS-Protection': '1; mode=block'
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// If auth is unavailable (mock), skip heavy auth handling to avoid runtime errors
	if (isMock || !svelteKitHandler) {
		// no session; leave locals empty so UI pages can render during dev
		const response = await resolve(event);
		// Still apply security headers
		Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
			response.headers.set(key, value);
		});
		return response;
	}

	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
		// mark as authenticated
		event.locals.isGuest = false;
	} else {
		// No authenticated session: create a lightweight guest identity so UI can act accordingly
		event.locals.session = null;
		event.locals.user = { id: 'guest', name: 'Guest', role: 'guest' } as any;
		event.locals.isGuest = true;
	}

	// Load user preferences into locals if available and user is not guest
	if (!event.locals.isGuest && drizzleDb) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const typedDb = drizzleDb as any;
			const prefRow = typedDb.select().from(user_preferences).where(eq(user_preferences.user_id, event.locals.user.id)).get();
			if (prefRow) {
				try {
					event.locals.preferences = JSON.parse(prefRow.prefs);
				} catch {
					event.locals.preferences = null;
				}
			}
		} catch (e) {
			// ignore preference loading errors
		}
	}

	const response = await svelteKitHandler({ event, resolve, auth, building });

	// Apply security headers to response
	Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	return response;
};

/**
 * Denies unauthenticated access to /api by default.
 *
 * Individual endpoints previously guarded themselves with `if (!locals.user)`,
 * which never fired: handleBetterAuth assigns a stub guest user whenever there
 * is no session, so `locals.user` is always truthy. Authorization therefore has
 * to key off `locals.session` / `locals.isGuest`, and it belongs in one place.
 *
 * The policy itself lives in $lib/server/apiGuard so it can be unit tested.
 */
const handleApiGuard: Handle = async ({ event, resolve }) => {
	const denied = shouldDenyApiRequest({
		pathname: event.url.pathname,
		authAvailable: !isMock && !!svelteKitHandler,
		hasSession: !!event.locals.session,
		isGuest: !!event.locals.isGuest
	});

	if (denied) return json({ error: 'Unauthorized' }, { status: 401 });

	return resolve(event);
};

export const handle: Handle = sequence(handleBetterAuth, handleApiGuard);
