/**
 * Client-side notification store
 * Connects to SSE stream, manages local state, exposes actions
 */

import type { Notification } from '$lib/server/notifications';

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	connected: boolean;
}

let state = $state<NotificationState>({
	notifications: [],
	unreadCount: 0,
	connected: false
});

let eventSource: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000; // starts at 1s, doubles up to 30s

function connect() {
	if (typeof window === 'undefined') return;
	if (eventSource) return; // already connected

	eventSource = new EventSource('/api/notifications/stream');

	eventSource.onopen = () => {
		state.connected = true;
		reconnectDelay = 1000; // reset backoff
	};

	eventSource.onmessage = (e) => {
		try {
			const payload = JSON.parse(e.data);

			if (payload.type === 'init') {
				state.notifications = payload.notifications ?? [];
				state.unreadCount = payload.unreadCount ?? 0;
			} else if (payload.type === 'notification') {
				state.notifications = [payload.notification, ...state.notifications].slice(0, 50);
				state.unreadCount += 1;
			}
		} catch {
			// malformed event — ignore
		}
	};

	eventSource.onerror = () => {
		state.connected = false;
		eventSource?.close();
		eventSource = null;

		// Exponential backoff reconnect
		if (reconnectTimer) clearTimeout(reconnectTimer);
		reconnectTimer = setTimeout(() => {
			reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
			connect();
		}, reconnectDelay);
	};
}

function disconnect() {
	if (reconnectTimer) clearTimeout(reconnectTimer);
	eventSource?.close();
	eventSource = null;
	state.connected = false;
}

/** Mark single notification read */
export async function markRead(id: string): Promise<void> {
	const n = state.notifications.find((x) => x.id === id);
	if (!n || n.read) return;

	n.read = true;
	state.unreadCount = Math.max(0, state.unreadCount - 1);

	await fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {});
}

/** Mark all notifications read */
export async function markAllRead(): Promise<void> {
	for (const n of state.notifications) n.read = true;
	state.unreadCount = 0;

	await fetch('/api/notifications', { method: 'PATCH' }).catch(() => {});
}

/** Clear all notifications */
export async function clearAll(): Promise<void> {
	state.notifications = [];
	state.unreadCount = 0;

	await fetch('/api/notifications', { method: 'DELETE' }).catch(() => {});
}

/** Call on app mount */
export function initNotifications() {
	connect();
	return disconnect; // return cleanup
}

export { state as notificationState };
