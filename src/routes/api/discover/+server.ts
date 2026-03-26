import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	submitDiscoveryProfile,
	listDiscoveryProfiles,
	removeDiscoveryProfile,
	type DiscoveryProfile
} from '$lib/server/discoveryQueries';

/** GET /api/discover — list all opted-in writers */
export const GET: RequestHandler = async () => {
	return json({ profiles: listDiscoveryProfiles() });
};

/** POST /api/discover — submit or refresh current user's profile */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json().catch(() => ({}));
	const { displayName, currentStreak, longestStreak, totalWords, topBadgeIcon, topBadgeName } = body;

	const profile: DiscoveryProfile = {
		userId: locals.user.id,
		displayName: displayName ?? `@user${locals.user.id.slice(0, 6)}`,
		currentStreak: currentStreak ?? 0,
		longestStreak: longestStreak ?? 0,
		totalWords: totalWords ?? 0,
		topBadgeIcon: topBadgeIcon ?? '✍️',
		topBadgeName: topBadgeName ?? 'Writer',
		submittedAt: new Date().toISOString()
	};

	submitDiscoveryProfile(profile);
	return json({ ok: true });
};

/** DELETE /api/discover — remove current user from discovery */
export const DELETE: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	removeDiscoveryProfile(locals.user.id);
	return json({ ok: true });
};
