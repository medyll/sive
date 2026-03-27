import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { challengeParticipants } from '$lib/server/db/schema/challenges';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/challenges/[id]/leave — Leave a challenge
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

	// Check if joined
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

	if (!existing) {
		return json({ error: 'Not joined this challenge' }, { status: 400 });
	}

	// Leave the challenge
	typedDb
		.delete(challengeParticipants)
		.where(
			and(
				eq(challengeParticipants.challengeId, challengeId),
				eq(challengeParticipants.userId, userId)
			)
		)
		.run();

	return json({ success: true, message: 'Left challenge successfully' });
};
