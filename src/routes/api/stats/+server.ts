import { json, type RequestHandler } from '@sveltejs/kit';
import { db, isMock } from '$lib/server/db';
import { documents } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { computeUserStats, computeDocStats } from '$lib/server/stats';

const GUEST_EMPTY = {
	totalWords: 0, totalDocs: 0, totalChars: 0, avgWordsPerDoc: 0,
	longestDoc: null, mostRecentEdit: 0, activityByDay: {},
	currentStreak: 0, longestStreak: 0, readingTimeMinutes: 0
};

export const GET: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId || userId === 'guest') return json(GUEST_EMPTY);

	if (isMock || !db) return json(GUEST_EMPTY);

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		const docs = typedDb.select().from(documents).where(eq(documents.user_id, userId)).all() ?? [];
		return json(computeUserStats(docs));
	} catch {
		return json(GUEST_EMPTY);
	}
};
