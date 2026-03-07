import { db, isMock } from '$lib/server/db';
import { user_preferences } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const GUEST_USER_ID = 'guest';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication in production
	if (!isMock && !locals.user) {
		throw redirect(302, '/auth');
	}

	const userId = locals.user?.id ?? GUEST_USER_ID;

	if (isMock || !db) {
		return { prefs: null, user: locals.user ?? null };
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const prefRow = typedDb.select().from(user_preferences).where(eq(user_preferences.user_id, userId)).get();
	if (prefRow) {
		try {
			const prefs = JSON.parse(prefRow.prefs);
			return { prefs, user: locals.user ?? null };
		} catch {
			return { prefs: null, user: locals.user ?? null };
		}
	}

	return { prefs: null, user: locals.user ?? null };
};

export const actions: Actions = {
	savePreferences: async ({ request, locals }) => {
		const form = await request.formData();
		const prefs = form.get('prefs') as string;
		const userId = locals.user?.id;
		if (!userId) return fail(401, { error: 'Not authenticated' });

		if (isMock || !db) {
			// DB unavailable — act as no-op success so client can still save locally
			return { success: true };
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		const existing = typedDb.select().from(user_preferences).where(eq(user_preferences.user_id, userId)).get();
		const now = Date.now();
		if (existing) {
			typedDb.update(user_preferences).set({ prefs, updated_at: now }).where(eq(user_preferences.user_id, userId)).run();
		} else {
			typedDb.insert(user_preferences).values({ id: crypto.randomUUID(), user_id: userId, prefs, updated_at: now }).run();
		}

		return { success: true };
	}
};
