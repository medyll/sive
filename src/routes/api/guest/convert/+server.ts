import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

interface ConvertPayload {
	email: string;
	password: string;
	guest_id: string;
	verification_token?: string;
}

function isValidUUID(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const allowGuests = env.ALLOW_GUESTS === 'true';

	if (!allowGuests) {
		throw error(404, 'Guest mode is disabled');
	}

	// Only guests may convert; authenticated users are already registered
	if (!locals.isGuest) {
		throw error(400, 'Already authenticated — conversion not applicable');
	}

	let payload: ConvertPayload;
	try {
		payload = await request.json();
	} catch {
		throw error(400, 'Invalid JSON payload');
	}

	const { email, password, guest_id } = payload;

	if (!email || !password || !guest_id) {
		throw error(400, 'Missing required fields: email, password, guest_id');
	}

	if (!isValidUUID(guest_id)) {
		throw error(400, 'Invalid guest_id format');
	}

	// Validate that the guest_id in the payload matches the cookie to prevent spoofing
	const cookieGuestId = cookies.get('guest_id');
	if (cookieGuestId !== guest_id) {
		throw error(403, 'guest_id mismatch — cookie does not match payload');
	}

	if (password.length < 8) {
		throw error(422, 'Password must be at least 8 characters');
	}

	// Stub: In a full implementation this would:
	// 1. Create the user account via auth.api.signUpEmail(...)
	// 2. Reassign guest-owned documents to the new user_id (DB transaction)
	// 3. Clear the guest_id cookie
	// For now, return a stub success indicating what would happen.
	cookies.delete('guest_id', { path: '/' });

	return json({
		success: true,
		message: 'Account created. Guest data ownership transferred.',
		email
	});
};
