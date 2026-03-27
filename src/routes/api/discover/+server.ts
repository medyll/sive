import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { writerDiscovery, activityEvents } from '$lib/server/db/schema/discovery';
import { eq } from 'drizzle-orm';

/**
 * GET /api/discover — List writers who opted into discovery
 */
export const GET: RequestHandler = async () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	const profiles = typedDb
		.select()
		.from(writerDiscovery)
		.where(eq(writerDiscovery.optedIn, 1))
		.orderBy(writerDiscovery.currentStreak, 'desc')
		.all();

	return json({ profiles });
};

/**
 * POST /api/discover — Opt into discovery (create or update profile)
 * Body: { displayName, currentStreak, longestStreak, totalWords, topBadgeIcon, topBadgeName }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json().catch(() => ({}));
	const {
		displayName,
		currentStreak = 0,
		longestStreak = 0,
		totalWords = 0,
		topBadgeIcon = '✍️',
		topBadgeName = 'Writer'
	} = body;

	if (!displayName) {
		return json({ error: 'Display name required' }, { status: 400 });
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	// Check if profile exists
	const existing = typedDb
		.select()
		.from(writerDiscovery)
		.where(eq(writerDiscovery.userId, userId))
		.get();

	if (existing) {
		// Update existing profile
		typedDb
			.update(writerDiscovery)
			.set({
				displayName: displayName.slice(0, 30),
				currentStreak,
				longestStreak,
				totalWords,
				topBadgeIcon,
				topBadgeName,
				optedIn: 1,
				updatedAt: Date.now()
			})
			.where(eq(writerDiscovery.userId, userId))
			.run();

		return json({ success: true, message: 'Profile updated' });
	} else {
		// Create new profile
		typedDb
			.insert(writerDiscovery)
			.values({
				userId,
				displayName: displayName.slice(0, 30),
				currentStreak,
				longestStreak,
				totalWords,
				topBadgeIcon,
				topBadgeName,
				optedIn: 1,
				updatedAt: Date.now()
			})
			.run();

		return json({ success: true, message: 'Profile created' }, { status: 201 });
	}
};

/**
 * DELETE /api/discover — Opt out of discovery
 */
export const DELETE: RequestHandler = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	typedDb
		.update(writerDiscovery)
		.set({ optedIn: 0, updatedAt: Date.now() })
		.where(eq(writerDiscovery.userId, userId))
		.run();

	return json({ success: true, message: 'Opted out of discovery' });
};
