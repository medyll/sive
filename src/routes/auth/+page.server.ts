import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { auth, isMock } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

// Redirect authenticated users away from login page
export const load: PageServerLoad = async ({ locals }) => {
	if (!isMock && locals.user && (locals.user as any).id !== 'guest') {
		throw redirect(302, '/');
	}
	return {
		isMock,
		hasGithub: !isMock && Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
	};
};

export const actions: Actions = {
	login: async ({ request }) => {
		if (isMock) {
			return fail(503, { error: 'Auth unavailable in dev mode (no database).' });
		}

		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		try {
			await auth.api.signInEmail({ email, password });
			throw redirect(302, '/');
		} catch (err: unknown) {
			if (err instanceof Response || (err as { status?: number }).status === 302) throw err;
			return fail(401, { error: 'Invalid email or password.' });
		}
	},

	github: async () => {
		if (isMock) {
			return fail(503, { error: 'Auth unavailable in dev mode (no database).' });
		}
		const result = await auth.api.signInSocial({ provider: 'github' });
		if (result?.url) {
			throw redirect(302, result.url);
		}
		return fail(500, { error: 'GitHub OAuth unavailable.' });
	}
};
