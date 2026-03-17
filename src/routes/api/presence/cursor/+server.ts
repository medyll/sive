import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In-memory cursor store: docId → Map<userId, { offset, selection, userName, color, ts }>
interface CursorEntry {
	userId: string;
	userName: string;
	color: string;
	offset: number;
	selection: { start: number; end: number } | null;
	ts: number;
}

const cursorStore = new Map<string, Map<string, CursorEntry>>();
const subscribers = new Map<string, Set<(data: CursorEntry) => void>>();

export function subscribeCursors(docId: string, fn: (data: CursorEntry) => void) {
	if (!subscribers.has(docId)) subscribers.set(docId, new Set());
	subscribers.get(docId)!.add(fn);
	return () => subscribers.get(docId)?.delete(fn);
}

export function getCursors(docId: string): CursorEntry[] {
	const map = cursorStore.get(docId);
	if (!map) return [];
	const now = Date.now();
	// Expire cursors older than 10s
	for (const [uid, entry] of map) {
		if (now - entry.ts > 10_000) map.delete(uid);
	}
	return [...map.values()];
}

// Debounce map: userId → last broadcast ts
const lastBroadcast = new Map<string, number>();
const DEBOUNCE_MS = 200;

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json().catch(() => null);
	if (!body?.docId) return json({ error: 'docId required' }, { status: 400 });

	const { docId, offset, selection } = body;
	const userId = locals.user.id;
	const now = Date.now();

	// Debounce per user
	const lastTs = lastBroadcast.get(userId) ?? 0;
	if (now - lastTs < DEBOUNCE_MS) return json({ ok: true, debounced: true });
	lastBroadcast.set(userId, now);

	// Lazy import to avoid circular dep
	const { getCursorColor } = await import('$lib/cursorColors');

	const entry: CursorEntry = {
		userId,
		userName: locals.user.name ?? locals.user.email ?? 'Anonymous',
		color: getCursorColor(userId),
		offset: Number(offset) || 0,
		selection: selection ?? null,
		ts: now
	};

	if (!cursorStore.has(docId)) cursorStore.set(docId, new Map());
	cursorStore.get(docId)!.set(userId, entry);

	// Fan out to SSE subscribers
	subscribers.get(docId)?.forEach((fn) => fn(entry));

	return json({ ok: true });
};
