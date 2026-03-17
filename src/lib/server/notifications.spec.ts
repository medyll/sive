import { describe, it, expect, beforeEach } from 'vitest';
import {
	push,
	markRead,
	markAllRead,
	getAll,
	getUnread,
	clear,
	subscribe
} from './notifications';

const USER = 'user-test-01';
const OTHER = 'user-test-02';

beforeEach(() => {
	clear(USER);
	clear(OTHER);
});

describe('push', () => {
	it('should add a notification for a user', () => {
		push({ userId: USER, type: 'doc_shared', title: 'Shared', body: 'Doc shared with you' });
		expect(getAll(USER).length).toBe(1);
	});

	it('should prepend (newest first)', () => {
		push({ userId: USER, type: 'system', title: 'First', body: '' });
		push({ userId: USER, type: 'system', title: 'Second', body: '' });
		const list = getAll(USER);
		expect(list[0].title).toBe('Second');
		expect(list[1].title).toBe('First');
	});

	it('should cap at 50 notifications', () => {
		for (let i = 0; i < 55; i++) {
			push({ userId: USER, type: 'system', title: `N${i}`, body: '' });
		}
		expect(getAll(USER).length).toBe(50);
	});

	it('should assign unique ids', () => {
		const a = push({ userId: USER, type: 'system', title: 'A', body: '' });
		const b = push({ userId: USER, type: 'system', title: 'B', body: '' });
		expect(a.id).not.toBe(b.id);
	});

	it('should set read=false by default', () => {
		const n = push({ userId: USER, type: 'system', title: 'T', body: '' });
		expect(n.read).toBe(false);
	});

	it('should not affect other users', () => {
		push({ userId: USER, type: 'system', title: 'T', body: '' });
		expect(getAll(OTHER).length).toBe(0);
	});

	it('should notify SSE subscribers', () => {
		const received: string[] = [];
		const unsub = subscribe(USER, (n) => received.push(n.title));
		push({ userId: USER, type: 'system', title: 'Live', body: '' });
		expect(received).toContain('Live');
		unsub();
	});
});

describe('markRead', () => {
	it('should mark a single notification read', () => {
		const n = push({ userId: USER, type: 'system', title: 'T', body: '' });
		markRead(USER, n.id);
		expect(getAll(USER)[0].read).toBe(true);
	});

	it('should return false for unknown id', () => {
		expect(markRead(USER, 'nonexistent')).toBe(false);
	});

	it('should not affect other notifications', () => {
		push({ userId: USER, type: 'system', title: 'A', body: '' });
		const b = push({ userId: USER, type: 'system', title: 'B', body: '' });
		markRead(USER, b.id);
		const list = getAll(USER);
		expect(list.find((n) => n.title === 'A')?.read).toBe(false);
		expect(list.find((n) => n.title === 'B')?.read).toBe(true);
	});
});

describe('markAllRead', () => {
	it('should mark all unread notifications read', () => {
		push({ userId: USER, type: 'system', title: 'A', body: '' });
		push({ userId: USER, type: 'system', title: 'B', body: '' });
		const count = markAllRead(USER);
		expect(count).toBe(2);
		expect(getUnread(USER).count).toBe(0);
	});

	it('should return 0 when nothing to mark', () => {
		expect(markAllRead(USER)).toBe(0);
	});
});

describe('getUnread', () => {
	it('should return only unread notifications', () => {
		const a = push({ userId: USER, type: 'system', title: 'A', body: '' });
		push({ userId: USER, type: 'system', title: 'B', body: '' });
		markRead(USER, a.id);
		const result = getUnread(USER);
		expect(result.count).toBe(1);
		expect(result.notifications[0].title).toBe('B');
	});

	it('should return count=0 for new user', () => {
		expect(getUnread('brand-new-user').count).toBe(0);
	});
});

describe('clear', () => {
	it('should remove all notifications for a user', () => {
		push({ userId: USER, type: 'system', title: 'T', body: '' });
		clear(USER);
		expect(getAll(USER).length).toBe(0);
	});

	it('should not affect other users', () => {
		push({ userId: USER, type: 'system', title: 'T', body: '' });
		push({ userId: OTHER, type: 'system', title: 'O', body: '' });
		clear(USER);
		expect(getAll(OTHER).length).toBe(1);
	});
});

describe('subscribe / unsubscribe', () => {
	it('should stop receiving after unsubscribe', () => {
		const received: string[] = [];
		const unsub = subscribe(USER, (n) => received.push(n.title));
		push({ userId: USER, type: 'system', title: 'Before', body: '' });
		unsub();
		push({ userId: USER, type: 'system', title: 'After', body: '' });
		expect(received).toEqual(['Before']);
	});

	it('should support multiple subscribers', () => {
		const a: string[] = [];
		const b: string[] = [];
		const unsubA = subscribe(USER, (n) => a.push(n.id));
		const unsubB = subscribe(USER, (n) => b.push(n.id));
		const n = push({ userId: USER, type: 'system', title: 'T', body: '' });
		expect(a).toContain(n.id);
		expect(b).toContain(n.id);
		unsubA();
		unsubB();
	});
});
