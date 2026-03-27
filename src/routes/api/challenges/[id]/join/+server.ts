import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { challenges, challengeParticipants } from '$lib/server/db/schema/challenges';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/challenges/[id]/join — Join a challenge
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const challengeId = params.id;
	if (!challengeId) {
		return json({ error: 'Challenge ID required' }, { status: 400 });
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	// Check if challenge exists and is active
	const challenge = typedDb
		.select()
		.from(challenges)
		.where(and(eq(challenges.id, challengeId)))
		.get();

	if (!challenge) {
		return json({ error: 'Challenge not found' }, { status: 404 });
	}

	if (Date.now() > challenge.endsAt) {
		return json({ error: 'Challenge has ended' }, { status: 400 });
	}

	// Check if already joined
	const existing = typedDb
		.select()
		.from(challengeParticipants)
		.where(
			and(
				eq(challengeParticipants.challengeId, challengeId),
				eq(challengeParticipants.userId, userId)
			)
		)
		.get();

	if (existing) {
		return json({ error: 'Already joined this challenge' }, { status: 400 });
	}

	// Join the challenge
	typedDb
		.insert(challengeParticipants)
		.values({
			challengeId,
			userId,
			joinedAt: Date.now(),
			wordsContributed: 0
		})
		.run();

	return json({ success: true, message: 'Joined challenge successfully' });
};
