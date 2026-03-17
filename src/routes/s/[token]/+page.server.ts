import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolveShareLink } from '$lib/server/sharing';

export const load: PageServerLoad = async ({ params, platform }) => {
	const link = resolveShareLink(params.token);
	if (!link) throw error(404, 'Share link not found or expired');

	// Fetch the document content — reuse DB pattern from app
	// For now return the link metadata; the page will fetch content
	return { docId: link.docId, token: params.token };
};
