/**
 * notificationStore — in-app notifications
 *
 * Types: streak_reminder | partner_activity | challenge_deadline | goal_reminder
 * Auto-dismiss after 6s. Ring buffer: max 50. Persists to localStorage.
 */

const STORAGE_KEY = 'sive:notifications';
const MAX_NOTIFICATIONS = 50;
const AUTO_DISMISS_MS = 6000;

export type NotificationType =
	| 'streak_reminder'
	| 'partner_activity'
	| 'challenge_deadline'
	| 'goal_reminder';

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	meta?: Record<string, unknown>;
	createdAt: string;
	read: boolean;
}

export interface NotificationState {
	items: Notification[];
}

function load(): NotificationState {
	if (typeof localStorage === 'undefined') return { items: [] };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : { items: [] };
	} catch {
		return { items: [] };
	}
}

function save(state: NotificationState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

let _idCounter = 0;
function generateId(): string {
	return `notif_${Date.now()}_${++_idCounter}`;
}

function createNotificationStore() {
	let state = $state<NotificationState>(load());

	const unreadCount = $derived(state.items.filter((n) => !n.read).length);

	function notify(
		type: NotificationType,
		message: string,
		meta?: Record<string, unknown>
	): string {
		const id = generateId();
		const notification: Notification = {
			id,
			type,
			message,
			meta,
			createdAt: new Date().toISOString(),
			read: false
		};

		// Ring buffer: drop oldest if at cap
		const items = [notification, ...state.items].slice(0, MAX_NOTIFICATIONS);
		state = { items };
		save(state);

		// Auto-dismiss after 6s
		if (typeof setTimeout !== 'undefined') {
			setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
		}

		return id;
	}

	function dismiss(id: string): void {
		state = { items: state.items.filter((n) => n.id !== id) };
		save(state);
	}

	function markAllRead(): void {
		state = { items: state.items.map((n) => ({ ...n, read: true })) };
		save(state);
	}

	function reset(): void {
		state = { items: [] };
		save(state);
	}

	return {
		get state() { return state; },
		get unreadCount() { return unreadCount; },
		notify,
		dismiss,
		markAllRead,
		reset
	};
}

export const notificationStore = createNotificationStore();
