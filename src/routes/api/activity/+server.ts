import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { activityEvents } from '$lib/server/db/schema/discovery';
import { eq, desc, limit } from 'drizzle-orm';

/**
 * GET /api/activity — Get activity feed
 * Query params:
 * - limit: number of events (default: 50, max: 100)
 * - userId: filter by specific user
 * - type: filter by event type
 * - since: timestamp to get events since
 */
export const GET: RequestHandler = async ({ url }) => {
	const limitParam = parseInt(url.searchParams.get('limit') ?? '50');
	const userId = url.searchParams.get('userId');
	const type = url.searchParams.get('type');
	const since = url.searchParams.get('since');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	let query = typedDb.select().from(activityEvents);

	// Apply filters
	const conditions = [];
	if (userId) conditions.push(eq(activityEvents.userId, userId));
	if (type) conditions.push(eq(activityEvents.type, type));
	if (since) conditions.push(eq(activityEvents.timestamp, parseInt(since)));

	if (conditions.length > 0) {
		// @ts-ignore - Drizzle dynamic conditions
		query = query.where(conditions[0]);
		for (const cond of conditions.slice(1)) {
			// @ts-ignore
			query = query.and(cond);
		}
	}

	// Order by timestamp descending and limit
	const events = query
		.orderBy(desc(activityEvents.timestamp))
		.limit(Math.min(limitParam, 100))
		.all();

	return json({ events });
};

/**
 * POST /api/activity — Emit activity event
 * Body: { type, displayName, payload }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const userId = locals.user?.id ?? 'anonymous';

	const body = await request.json().catch(() => ({}));
	const { type, displayName = locals.user?.name ?? 'Anonymous', payload = {} } = body;

	if (!type) {
		return json({ error: 'Event type required' }, { status: 400 });
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	const event = typedDb
		.insert(activityEvents)
		.values({
			type,
			userId,
			displayName,
			timestamp: Date.now(),
			payload: JSON.stringify(payload)
		})
		.returning()
		.get();

	return json({ event }, { status: 201 });
};
