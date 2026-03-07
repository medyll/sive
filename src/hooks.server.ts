import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth, isMock } from '$lib/server/auth';
import { db as drizzleDb } from '$lib/server/db';
import { user_preferences } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

let svelteKitHandler: any;
try {
	// import only when available
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	svelteKitHandler = require('better-auth/svelte-kit').svelteKitHandler;
} catch (e) {
	svelteKitHandler = null;
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// If auth is unavailable (mock), skip heavy auth handling to avoid runtime errors
	if (isMock || !svelteKitHandler) {
		// no session; leave locals empty so UI pages can render during dev
		return resolve(event);
	}

	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;

		// Load user preferences into locals if available
		if (drizzleDb) {
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
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
