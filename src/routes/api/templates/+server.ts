import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAllTemplates,
	saveUserTemplate,
	deleteUserTemplate,
	type NewTemplate
} from '$lib/server/templates';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

export const GET: RequestHandler = async ({ locals }) => {
	const userId = locals.user?.id ?? 'guest';
	const templates = getAllTemplates(userId);
	return json(templates);
};

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const body = await request.json().catch(() => null);
	if (!body || !body.name || !body.content) {
		return json({ error: 'name and content required' }, { status: 400 });
	}

	const input: NewTemplate = {
		name: String(body.name).slice(0, 100),
		description: String(body.description ?? '').slice(0, 300),
		content: String(body.content).slice(0, 100_000),
		category: ['fiction', 'nonfiction', 'business', 'poetry', 'general'].includes(body.category)
			? body.category
			: 'general'
	};

	const template = saveUserTemplate(locals.user.id, input);
	if (!template) return json({ error: 'Template limit reached (max 20)' }, { status: 422 });
	return json(template, { status: 201 });
};

export const DELETE: RequestHandler = async (event) => {
	const { locals, url } = event;
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const id = url.searchParams.get('id');
	if (!id) return json({ error: 'id required' }, { status: 400 });

	const deleted = deleteUserTemplate(locals.user.id, id);
	if (!deleted) return json({ error: 'Not found' }, { status: 404 });
	return json({ ok: true });
};
