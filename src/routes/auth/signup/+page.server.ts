import { fail, redirect } from '@sveltejs/kit';
import { auth, isMock } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!isMock && locals.user) {
		throw redirect(302, '/app');
	}
	return { isMock };
};

export const actions: Actions = {
	default: async ({ request }) => {
		if (isMock) {
			return fail(503, { error: 'Auth unavailable in dev mode (no database).' });
		}

		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const name = (data.get('name') as string) ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		try {
			await auth.api.signUpEmail({ email, password, name });
			throw redirect(302, '/app');
		} catch (err: unknown) {
			if (err instanceof Response || (err as { status?: number }).status === 302) throw err;
			const msg = (err as { message?: string })?.message;
			return fail(400, { error: msg ?? 'Could not create account.' });
		}
	}
};
