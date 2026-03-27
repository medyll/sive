import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { challengeParticipants, challenges } from '$lib/server/db/schema/challenges';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/challenges/[id]/progress — Get user's progress in a challenge
 */
export const GET: RequestHandler = async ({ params, locals }) => {
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

	const progress = typedDb
		.select()
		.from(challengeParticipants)
		.where(
			and(
				eq(challengeParticipants.challengeId, challengeId),
				eq(challengeParticipants.userId, userId)
			)
		)
		.get();

	if (!progress) {
		return json({ error: 'Not joined this challenge' }, { status: 404 });
	}

	// Get challenge details for percentage calculation
	const challenge = typedDb
		.select()
		.from(challenges)
		.where(eq(challenges.id, challengeId))
		.get();

	const percentage = challenge
		? Math.round((progress.wordsContributed / challenge.targetWords) * 100)
		: 0;

	return json({
		challengeId,
		wordsContributed: progress.wordsContributed,
		targetWords: challenge?.targetWords ?? 0,
		percentage: Math.min(100, percentage),
		joinedAt: progress.joinedAt
	});
};

/**
 * POST /api/challenges/[id]/progress — Update progress (add words)
 * Body: { words: number }
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const challengeId = params.id;
	if (!challengeId) {
		return json({ error: 'Challenge ID required' }, { status: 400 });
	}

	const body = await request.json().catch(() => ({}));
	const { words } = body;

	if (typeof words !== 'number' || words < 0) {
		return json({ error: 'Valid word count required' }, { status: 400 });
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

	// Update progress
	typedDb
		.update(challengeParticipants)
		.set({
			wordsContributed: existing.wordsContributed + words
		})
		.where(
			and(
				eq(challengeParticipants.challengeId, challengeId),
				eq(challengeParticipants.userId, userId)
			)
		)
		.run();

	return json({
		success: true,
		wordsContributed: existing.wordsContributed + words
	});
};
