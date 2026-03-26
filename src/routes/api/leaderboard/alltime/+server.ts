import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllTimeTopByStreak, getAllTimeTopByWords, getUserAlltimeRank } from '$lib/server/leaderboardQueries';

/** GET /api/leaderboard/alltime?view=streak|words */
export const GET: RequestHandler = async ({ url, locals }) => {
	const view = url.searchParams.get('view') === 'words' ? 'words' : 'streak';

	const entries = view === 'words' ? getAllTimeTopByWords(10) : getAllTimeTopByStreak(10);
	const userRank = locals.user ? getUserAlltimeRank(locals.user.id) : null;

	return json({ entries, userRank, view });
};
