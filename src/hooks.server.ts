import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth, isMock } from '$lib/server/auth';
import { db as drizzleDb } from '$lib/server/db';
import { user_preferences } from '$lib/server/db/schema';
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
		"default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
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

export const handle: Handle = handleBetterAuth;
