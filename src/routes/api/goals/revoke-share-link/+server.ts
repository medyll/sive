import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeGoalShareLink } from '$lib/server/goalSharing';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const { token } = await request.json().catch(() => ({}));
	if (!token) return json({ error: 'token required' }, { status: 400 });

	const ok = revokeGoalShareLink(token, locals.user.id);
	if (!ok) return json({ error: 'Not found or not yours' }, { status: 404 });

	return json({ ok: true });
};
