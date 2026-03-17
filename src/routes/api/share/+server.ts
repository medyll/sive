import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createShareLink, revokeShareLink, getDocShareLinks } from '$lib/server/sharing';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const docId = url.searchParams.get('docId');
	if (!docId) return json({ error: 'docId required' }, { status: 400 });
	return json(getDocShareLinks(docId, locals.user.id));
};

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const { docId, ttlHours } = await request.json().catch(() => ({}));
	if (!docId) return json({ error: 'docId required' }, { status: 400 });

	const link = createShareLink(docId, locals.user.id, ttlHours ? Number(ttlHours) : undefined);
	return json(link, { status: 201 });
};

export const DELETE: RequestHandler = async (event) => {
	const { locals, url } = event;
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const token = url.searchParams.get('token');
	if (!token) return json({ error: 'token required' }, { status: 400 });
	const ok = revokeShareLink(token, locals.user.id);
	if (!ok) return json({ error: 'Not found or not yours' }, { status: 404 });
	return json({ ok: true });
};
