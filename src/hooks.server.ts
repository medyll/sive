import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth, isMock } from '$lib/server/auth';

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
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
