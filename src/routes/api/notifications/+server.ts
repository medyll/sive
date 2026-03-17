import { json, type RequestHandler } from '@sveltejs/kit';
import { getAll, markAllRead, clear, getUnread } from '$lib/server/notifications';

function getUserId(event: Parameters<RequestHandler>[0]): string | null {
	return event.locals.user?.id ?? null;
}

/** GET /api/notifications — list all + unread count */
export const GET: RequestHandler = async (event) => {
	const userId = getUserId(event);
	if (!userId || userId === 'guest') {
		return json({ notifications: [], unreadCount: 0 });
	}

	const notifications = getAll(userId);
	const unreadCount = notifications.filter((n) => !n.read).length;

	return json({ notifications, unreadCount });
};

/** DELETE /api/notifications — clear all */
export const DELETE: RequestHandler = async (event) => {
	const userId = getUserId(event);
	if (!userId || userId === 'guest') {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	clear(userId);
	return json({ success: true });
};

/** PATCH /api/notifications — mark all read */
export const PATCH: RequestHandler = async (event) => {
	const userId = getUserId(event);
	if (!userId || userId === 'guest') {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	const count = markAllRead(userId);
	return json({ success: true, marked: count });
};
