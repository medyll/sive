import { db, isMock } from '$lib/server/db';
import { documents } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { computeUserStats, computeDocStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	const isGuest = !userId || userId === 'guest';

	if (isGuest || isMock || !db) {
		return {
			stats: {
				totalWords: 0, totalDocs: 0, totalChars: 0, avgWordsPerDoc: 0,
				longestDoc: null, mostRecentEdit: 0, activityByDay: {},
				currentStreak: 0, longestStreak: 0, readingTimeMinutes: 0
			},
			recentDocs: [],
			topDocs: []
		};
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		const docs = typedDb.select().from(documents).where(eq(documents.user_id, userId)).all() ?? [];

		const stats = computeUserStats(docs);
		const docStats = docs.map(computeDocStats);

		const recentDocs = [...docs]
			.sort((a: { updated_at: number }, b: { updated_at: number }) => b.updated_at - a.updated_at)
			.slice(0, 5)
			.map((d: { id: string; title: string; updated_at: number }) => ({
				id: d.id, title: d.title, updatedAt: d.updated_at,
				wordCount: docStats.find((s: { id: string }) => s.id === d.id)?.wordCount ?? 0
			}));

		const topDocs = [...docStats]
			.sort((a, b) => b.wordCount - a.wordCount)
			.slice(0, 5);

		return { stats, recentDocs, topDocs };
	} catch {
		return {
			stats: {
				totalWords: 0, totalDocs: 0, totalChars: 0, avgWordsPerDoc: 0,
				longestDoc: null, mostRecentEdit: 0, activityByDay: {},
				currentStreak: 0, longestStreak: 0, readingTimeMinutes: 0
			},
			recentDocs: [],
			topDocs: []
		};
	}
};
