import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveShareLink } from '$lib/server/sharing';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const token = url.searchParams.get('token');
	if (!token) return json({ error: 'token required' }, { status: 400 });

	const link = resolveShareLink(token);
	if (!link) return json({ error: 'Link not found or expired' }, { status: 404 });

	// Fetch doc from DB — reuse same pattern as app page server
	// Fall back to a stub response if DB not available in this context
	try {
		const db = (locals as { db?: { prepare: (q: string) => { get: (...a: unknown[]) => unknown } } }).db;
		if (db) {
			const doc = db.prepare('SELECT id, title, content, updated_at FROM documents WHERE id = ?').get(link.docId) as
				| { id: string; title: string; content: string; updated_at: string }
				| undefined;
			if (!doc) return json({ error: 'Document not found' }, { status: 404 });
			return json({ id: doc.id, title: doc.title, content: doc.content, updatedAt: doc.updated_at });
		}
	} catch { /* DB unavailable */ }

	return json({ error: 'Document unavailable' }, { status: 503 });
};
