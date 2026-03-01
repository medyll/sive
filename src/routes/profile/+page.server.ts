import { fail, redirect } from '@sveltejs/kit';
import { auth, isMock } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!isMock && !locals.user) {
		throw redirect(302, '/auth');
	}
	return { user: locals.user ?? null, isMock };
};

export const actions: Actions = {
	signOut: async ({ cookies }) => {
		if (isMock) {
			return fail(503, { error: 'Auth unavailable in dev mode.' });
		}
		try {
			await auth.api.signOut({ headers: new Headers({ cookie: cookies.toString() }) });
		} catch {
			// Best-effort sign out
		}
		throw redirect(302, '/auth');
	}
};
