import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	const allowGuests = env.ALLOW_GUESTS === 'true';

	if (!allowGuests) {
		throw error(404, 'Guest mode is disabled');
	}

	if (!locals.isGuest) {
		// Authenticated users are not guests
		return json({ guestId: null, canConvert: false, authenticated: true });
	}

	const guestId = cookies.get('guest_id') ?? null;

	return json({
		guestId,
		canConvert: guestId !== null,
		authenticated: false
	});
};
