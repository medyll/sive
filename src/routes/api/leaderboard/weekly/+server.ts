import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { submitWeeklyStats, getUserWeeklyRank } from '$lib/server/leaderboardQueries';
import { getCachedWeeklyTop, invalidateWeeklyCache } from '$lib/server/leaderboardCache';

/** GET /api/leaderboard/weekly — fetch top 10 + current user's rank */
export const GET: RequestHandler = async ({ url, locals }) => {
	const force = url.searchParams.get('refresh') === 'true';
	const { data, cachedAt, fresh } = getCachedWeeklyTop(10, force);

	const userRank = locals.user ? getUserWeeklyRank(locals.user.id) : null;

	return json({
		entries: data,
		userRank,
		cachedAt: new Date(cachedAt).toISOString(),
		fresh
	});
};

/** POST /api/leaderboard/weekly — submit current user's stats */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json().catch(() => ({}));
	const { weeklyWords, currentStreak, totalWords, showReal, displayName } = body;

	if (typeof weeklyWords !== 'number') {
		return json({ error: 'weeklyWords required' }, { status: 400 });
	}

	submitWeeklyStats(
		locals.user.id,
		{ weeklyWords, currentStreak: currentStreak ?? 0, totalWords: totalWords ?? 0 },
		showReal ?? false,
		displayName ?? locals.user.id
	);

	invalidateWeeklyCache(); // Bust cache so next GET reflects new entry

	return json({ ok: true });
};
