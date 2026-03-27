import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { challenges, challengeParticipants } from '$lib/server/db/schema/challenges';
import { eq, and, gt } from 'drizzle-orm';

/**
 * GET /api/challenges — List active challenges
 * Optional query params:
 * - joined: 'true' to filter only joined challenges
 * - creator: filter by creator ID
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const joinedFilter = url.searchParams.get('joined');
	const creatorFilter = url.searchParams.get('creator');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const now = Date.now();

	let query;

	if (joinedFilter === 'true') {
		// Get challenges user has joined
		const participantChallenges = typedDb
			.select({ challengeId: challengeParticipants.challengeId })
			.from(challengeParticipants)
			.where(eq(challengeParticipants.userId, userId))
			.all();

		const challengeIds = participantChallenges.map((p: { challengeId: string }) => p.challengeId);

		if (challengeIds.length === 0) {
			return json({ challenges: [], joined: [] });
		}

		query = typedDb
			.select()
			.from(challenges)
			.where(
				and(
					gt(challenges.endsAt, now),
					creatorFilter ? eq(challenges.creatorId, creatorFilter) : undefined
				)
			)
			.all();

		// Filter to only joined challenges
		query = query.filter((c: { id: string }) => challengeIds.includes(c.id));
	} else {
		// Get all active challenges
		query = typedDb
			.select()
			.from(challenges)
			.where(
				and(
					gt(challenges.endsAt, now),
					creatorFilter ? eq(challenges.creatorId, creatorFilter) : undefined
				)
			)
			.all();
	}

	// Get user's joined challenge IDs
	const userJoins = typedDb
		.select({ challengeId: challengeParticipants.challengeId })
		.from(challengeParticipants)
		.where(eq(challengeParticipants.userId, userId))
		.all();

	const joinedIds = new Set(userJoins.map((j: { challengeId: string }) => j.challengeId));

	// Add joined status to each challenge
	const challengesWithStatus = query.map((c: { id: string }) => ({
		...c,
		joined: joinedIds.has(c.id)
	}));

	return json({ challenges: challengesWithStatus });
};

/**
 * POST /api/challenges — Create a new challenge
 * Body: { title, description, targetWords, durationDays }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json().catch(() => ({}));
	const { title, description = '', targetWords, durationDays } = body;

	if (!title || !targetWords || !durationDays) {
		return json({ error: 'Title, targetWords, and durationDays required' }, { status: 400 });
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	const now = Date.now();
	const endsAt = now + durationDays * 86_400_000;

	const result = typedDb
		.insert(challenges)
		.values({
			title: title.slice(0, 80),
			description: description.slice(0, 300),
			targetWords,
			durationDays,
			creatorId: userId,
			createdAt: now,
			endsAt
		})
		.returning()
		.get();

	return json({ challenge: result }, { status: 201 });
};
