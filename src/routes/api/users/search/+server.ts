import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, isMock } from '$lib/server/db';

/** GET /api/users/search?q=<email prefix> — search users by email */
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
	if (q.length < 2) return json({ users: [] });

	if (isMock || !db) {
		// Return a stub user for dev/testing
		if ('alice@example.com'.startsWith(q)) {
			return json({ users: [{ id: 'stub-alice', email: 'alice@example.com', name: 'Alice (stub)' }] });
		}
		return json({ users: [] });
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const { users } = await import('$lib/server/db/schema');
	const { like, ne, and } = await import('drizzle-orm');

	const results = typedDb
		.select({ id: users.id, email: users.email, name: users.name })
		.from(users)
		.where(and(like(users.email, `${q}%`), ne(users.id, locals.user.id)))
		.limit(5)
		.all();

	return json({ users: results ?? [] });
};
