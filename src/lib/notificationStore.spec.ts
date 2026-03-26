import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { notificationStore } from './notificationStore.svelte';

global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

beforeEach(() => {
	vi.useFakeTimers();
	vi.clearAllMocks();
	notificationStore.reset();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('notify', () => {
	it('adds a notification', () => {
		notificationStore.notify('streak_reminder', 'Test message');
		expect(notificationStore.state.items).toHaveLength(1);
		expect(notificationStore.state.items[0].message).toBe('Test message');
		expect(notificationStore.state.items[0].read).toBe(false);
	});

	it('prepends new notifications (newest first)', () => {
		notificationStore.notify('streak_reminder', 'First');
		notificationStore.notify('goal_reminder', 'Second');
		expect(notificationStore.state.items[0].message).toBe('Second');
	});

	it('returns an id', () => {
		const id = notificationStore.notify('streak_reminder', 'Test');
		expect(id).toBeTruthy();
	});

	it('auto-dismisses after 6s', () => {
		notificationStore.notify('streak_reminder', 'Auto dismiss');
		expect(notificationStore.state.items).toHaveLength(1);
		vi.advanceTimersByTime(6000);
		expect(notificationStore.state.items).toHaveLength(0);
	});

	it('caps at 50 items (ring buffer)', () => {
		for (let i = 0; i < 55; i++) {
			vi.clearAllTimers();
			notificationStore.notify('goal_reminder', `msg ${i}`);
		}
		expect(notificationStore.state.items).toHaveLength(50);
	});
});

describe('unreadCount', () => {
	it('counts unread notifications', () => {
		notificationStore.notify('streak_reminder', 'A');
		notificationStore.notify('streak_reminder', 'B');
		expect(notificationStore.unreadCount).toBe(2);
	});

	it('decreases after markAllRead', () => {
		notificationStore.notify('streak_reminder', 'A');
		notificationStore.markAllRead();
		expect(notificationStore.unreadCount).toBe(0);
	});
});

describe('dismiss', () => {
	it('removes a specific notification', () => {
		const id = notificationStore.notify('streak_reminder', 'To dismiss');
		notificationStore.dismiss(id);
		expect(notificationStore.state.items).toHaveLength(0);
	});

	it('is a no-op for unknown id', () => {
		notificationStore.notify('streak_reminder', 'Keep');
		notificationStore.dismiss('nonexistent');
		expect(notificationStore.state.items).toHaveLength(1);
	});
});

describe('markAllRead', () => {
	it('marks all as read', () => {
		notificationStore.notify('streak_reminder', 'A');
		notificationStore.notify('partner_activity', 'B');
		notificationStore.markAllRead();
		expect(notificationStore.state.items.every((n) => n.read)).toBe(true);
	});
});

describe('reset', () => {
	it('clears all notifications', () => {
		notificationStore.notify('streak_reminder', 'A');
		notificationStore.reset();
		expect(notificationStore.state.items).toHaveLength(0);
	});
});
