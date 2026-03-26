import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolveGoalShareLink } from '$lib/server/goalSharing';

export const load: PageServerLoad = async ({ params }) => {
	const linkId = params.linkId;

	// Validate and resolve the share link
	const link = resolveGoalShareLink(linkId);
	if (!link) {
		error(404, 'Share link not found or expired');
	}

	// Return the user ID and link info
	// The client will fetch the user's goals data
	return {
		linkId,
		userId: link.userId,
		expiresAt: link.expiresAt
	};
};
