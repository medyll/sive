import { fail, redirect } from '@sveltejs/kit';
import { auth, isMock } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!isMock && !locals.user) {
		throw redirect(302, '/auth');
	}
	return { user: locals.user ?? null, isMock };
};

export const actions: Actions = {
	updateName: async ({ request, locals }) => {
		if (isMock || !db || !locals.user) {
			return fail(503, { error: 'Unavailable in dev mode.' });
		}
		const data = await request.formData();
		const name = (data.get('name') as string ?? '').trim();
		if (!name) return fail(400, { error: 'Name cannot be empty.' });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		typedDb.update(users).set({ name }).where(eq(users.id, locals.user.id)).run();
		return { success: true };
	},

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
