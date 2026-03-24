import { describe, it, expect, beforeEach, vi } from 'vitest';
import { markRead, markAllRead, clearAll, notificationState } from './notificationStore.svelte';

// Stub fetch globally
const fetchMock = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', fetchMock);

// Stub EventSource so connect() doesn't blow up in jsdom
vi.stubGlobal('EventSource', class { onopen = null; onmessage = null; onerror = null; close() {} });

function seedNotifications() {
	// Directly mutate state via exposed reference
	notificationState.notifications = [
		{ id: 'n1', type: 'doc_shared', title: 'Shared', body: 'Doc shared', read: false, createdAt: Date.now(), docId: 'doc1' },
		{ id: 'n2', type: 'system',     title: 'Info',   body: 'System msg',  read: false, createdAt: Date.now() }
	];
	notificationState.unreadCount = 2;
}

beforeEach(() => {
	notificationState.notifications = [];
	notificationState.unreadCount = 0;
	fetchMock.mockClear();
});

describe('markRead', () => {
	it('marks a single notification as read and decrements count', async () => {
		seedNotifications();
		await markRead('n1');
		expect(notificationState.notifications.find(n => n.id === 'n1')?.read).toBe(true);
		expect(notificationState.unreadCount).toBe(1);
	});

	it('does nothing if notification already read', async () => {
		seedNotifications();
		notificationState.notifications[0].read = true;
		notificationState.unreadCount = 1;
		await markRead('n1');
		expect(notificationState.unreadCount).toBe(1);
	});

	it('calls PATCH API', async () => {
		seedNotifications();
		await markRead('n1');
		expect(fetchMock).toHaveBeenCalledWith('/api/notifications/n1', { method: 'PATCH' });
	});
});

describe('markAllRead', () => {
	it('marks all notifications read and resets count to 0', async () => {
		seedNotifications();
		await markAllRead();
		expect(notificationState.unreadCount).toBe(0);
		expect(notificationState.notifications.every(n => n.read)).toBe(true);
	});
});

describe('clearAll', () => {
	it('empties notifications and resets count', async () => {
		seedNotifications();
		await clearAll();
		expect(notificationState.notifications).toHaveLength(0);
		expect(notificationState.unreadCount).toBe(0);
	});
});
