/**
 * In-memory notification store
 * Max 50 notifications per user, newest first
 */

export type NotificationType = 'doc_shared' | 'doc_edited' | 'conflict' | 'mention' | 'system';

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	body: string;
	docId?: string;
	read: boolean;
	createdAt: number;
}

export type NewNotification = Omit<Notification, 'id' | 'read' | 'createdAt'>;

const MAX_PER_USER = 50;
const store = new Map<string, Notification[]>();

// SSE subscriber callbacks: userId → Set of send functions
const subscribers = new Map<string, Set<(n: Notification) => void>>();

function getList(userId: string): Notification[] {
	if (!store.has(userId)) store.set(userId, []);
	return store.get(userId)!;
}

export function push(input: NewNotification): Notification {
	const notification: Notification = {
		...input,
		id: crypto.randomUUID(),
		read: false,
		createdAt: Date.now()
	};

	const list = getList(input.userId);
	list.unshift(notification);

	// Trim to max
	if (list.length > MAX_PER_USER) list.splice(MAX_PER_USER);

	// Notify SSE subscribers
	const subs = subscribers.get(input.userId);
	if (subs) {
		for (const send of subs) send(notification);
	}

	return notification;
}

export function markRead(userId: string, id: string): boolean {
	const list = getList(userId);
	const n = list.find((x) => x.id === id);
	if (!n) return false;
	n.read = true;
	return true;
}

export function markAllRead(userId: string): number {
	const list = getList(userId);
	let count = 0;
	for (const n of list) {
		if (!n.read) { n.read = true; count++; }
	}
	return count;
}

export function getAll(userId: string): Notification[] {
	return [...getList(userId)];
}

export function getUnread(userId: string): { count: number; notifications: Notification[] } {
	const unread = getList(userId).filter((n) => !n.read);
	return { count: unread.length, notifications: unread };
}

export function clear(userId: string): void {
	store.set(userId, []);
}

/** Subscribe to live pushes for SSE streaming */
export function subscribe(userId: string, send: (n: Notification) => void): () => void {
	if (!subscribers.has(userId)) subscribers.set(userId, new Set());
	subscribers.get(userId)!.add(send);
	return () => subscribers.get(userId)?.delete(send);
}
