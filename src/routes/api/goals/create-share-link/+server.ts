import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createGoalShareLink } from '$lib/server/goalSharing';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

export const POST: RequestHandler = async (event) => {
	const { locals } = event;
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	// Create a new share link for this user's goals
	const link = createGoalShareLink(locals.user.id);

	return json(
		{
			token: link.token,
			url: `/goals/${link.token}`,
			expiresAt: link.expiresAt
		},
		{ status: 201 }
	);
};
