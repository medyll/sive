import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writable, get } from 'svelte/store';
import type { Readable } from 'svelte/store';

/**
 * Integration tests for presence state management
 * Tests presence tracking, status transitions, and store consistency
 */

interface OnlineUser {
	userId: string;
	clientId: string;
	name?: string;
	status: 'active' | 'idle' | 'offline';
	lastSeen?: number;
}

function createPresenceStore() {
	const users = writable<Map<string, OnlineUser>>(new Map());
	const updateTimers: Map<string, NodeJS.Timeout> = new Map();

	function addUser(userId: string, clientId: string, name?: string) {
		users.update((map) => {
			const user: OnlineUser = {
				userId,
				clientId,
				name,
				status: 'active',
				lastSeen: Date.now()
			};
			map.set(clientId, user);
			return map;
		});

		// Set idle timeout
		if (updateTimers.has(clientId)) {
			clearTimeout(updateTimers.get(clientId));
		}

		const idleTimeout = setTimeout(() => {
			setUserStatus(clientId, 'idle');
		}, 5000);

		updateTimers.set(clientId, idleTimeout);
	}

	function removeUser(clientId: string) {
		if (updateTimers.has(clientId)) {
			clearTimeout(updateTimers.get(clientId));
			updateTimers.delete(clientId);
		}

		users.update((map) => {
			map.delete(clientId);
			return map;
		});
	}

	function setUserStatus(clientId: string, status: OnlineUser['status']) {
		users.update((map) => {
			const user = map.get(clientId);
			if (user) {
				user.status = status;
				user.lastSeen = Date.now();
			}
			return map;
		});

		if (status === 'active' && updateTimers.has(clientId)) {
			clearTimeout(updateTimers.get(clientId));

			const idleTimeout = setTimeout(() => {
				setUserStatus(clientId, 'idle');
			}, 5000);

			updateTimers.set(clientId, idleTimeout);
		}
	}

	function updateActivity(clientId: string) {
		const currentUsers = get(users);
		const user = currentUsers.get(clientId);

		if (user) {
			setUserStatus(clientId, 'active');
		}
	}

	function getUsers(): OnlineUser[] {
		return Array.from(get(users).values());
	}

	function getUserCount(): number {
		return get(users).size;
	}

	function hasUser(clientId: string): boolean {
		return get(users).has(clientId);
	}

	function shutdown() {
		updateTimers.forEach((timer) => clearTimeout(timer));
		updateTimers.clear();
		users.set(new Map());
	}

	return {
		users: users as Readable<Map<string, OnlineUser>>,
		addUser,
		removeUser,
		setUserStatus,
		updateActivity,
		getUsers,
		getUserCount,
		hasUser,
		shutdown
	};
}

describe('Presence Store Integration', () => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	let store!: ReturnType<typeof createPresenceStore>;

	beforeEach(() => {
		vi.useFakeTimers();
		store = createPresenceStore() as ReturnType<typeof createPresenceStore>;
	});

	afterEach(() => {
		if (store) {
			store.shutdown();
		}
		vi.useRealTimers();
	});

	it('should add users with active status', () => {
		store.addUser('alice', 'c1', 'Alice');
		store.addUser('bob', 'c2', 'Bob');

		expect(store.getUserCount()).toBe(2);
		const users = store.getUsers();
		expect(users.some((u) => u.userId === 'alice')).toBe(true);
		expect(users.some((u) => u.userId === 'bob')).toBe(true);
		expect(users.every((u) => u.status === 'active')).toBe(true);
	});

	it('should transition user to idle after 5 seconds of inactivity', () => {
		store.addUser('alice', 'c1', 'Alice');

		// User starts as active
		let users = store.getUsers();
		expect(users[0].status).toBe('active');

		// Advance time by 5 seconds
		vi.advanceTimersByTime(5000);

		// User should now be idle
		users = store.getUsers();
		expect(users[0].status).toBe('idle');
	});

	it('should reset idle timeout when user is active', () => {
		store.addUser('alice', 'c1', 'Alice');

		// Advance 3 seconds
		vi.advanceTimersByTime(3000);

		// User activity updates status
		store.updateActivity('c1');

		let users = store.getUsers();
		expect(users[0].status).toBe('active');

		// Advance 3 more seconds (total 6)
		vi.advanceTimersByTime(3000);

		// User should still be active (timer was reset)
		users = store.getUsers();
		expect(users[0].status).toBe('active');

		// Wait for idle timeout from last activity
		vi.advanceTimersByTime(5000);

		users = store.getUsers();
		expect(users[0].status).toBe('idle');
	});

	it('should remove users completely', () => {
		store.addUser('alice', 'c1', 'Alice');
		store.addUser('bob', 'c2', 'Bob');

		expect(store.getUserCount()).toBe(2);

		store.removeUser('c1');

		expect(store.getUserCount()).toBe(1);
		expect(store.hasUser('c1')).toBe(false);
		expect(store.hasUser('c2')).toBe(true);
	});

	it('should handle multiple users with independent timeouts', () => {
		store.addUser('alice', 'c1', 'Alice');

		vi.advanceTimersByTime(2000);

		store.addUser('bob', 'c2', 'Bob');

		// Advance 4 more seconds (Alice at 6s total, Bob at 4s)
		vi.advanceTimersByTime(4000);

		let users = store.getUsers();
		const alice = users.find((u) => u.userId === 'alice');
		const bob = users.find((u) => u.userId === 'bob');

		// Alice should be idle (6s > 5s)
		// Bob should still be active (4s < 5s)
		expect(alice?.status).toBe('idle');
		expect(bob?.status).toBe('active');
	});

	it('should allow manual status changes', () => {
		store.addUser('alice', 'c1', 'Alice');

		store.setUserStatus('c1', 'offline');

		const users = store.getUsers();
		expect(users[0].status).toBe('offline');
	});

	it('should maintain lastSeen timestamp on activity', () => {
		store.addUser('alice', 'c1', 'Alice');

		const firstSeen = store.getUsers()[0].lastSeen!;

		vi.advanceTimersByTime(2000);

		store.updateActivity('c1');

		const secondSeen = store.getUsers()[0].lastSeen!;

		expect(secondSeen).toBeGreaterThan(firstSeen);
	});

	it('should support concurrent user management', () => {
		// Simulate 5 users joining rapidly
		for (let i = 0; i < 5; i++) {
			store.addUser(`user${i}`, `c${i}`, `User ${i}`);
		}

		expect(store.getUserCount()).toBe(5);

		// Simulate some users becoming idle
		vi.advanceTimersByTime(5000);

		const users = store.getUsers();
		const idleUsers = users.filter((u) => u.status === 'idle');
		expect(idleUsers.length).toBe(5);

		// Some users update activity
		store.updateActivity('c1');
		store.updateActivity('c3');

		const activeUsers = store.getUsers().filter((u) => u.status === 'active');
		expect(activeUsers.length).toBe(2);

		// Remove some users
		store.removeUser('c0');
		store.removeUser('c2');

		expect(store.getUserCount()).toBe(3);
	});

	it('should cleanup timers on removal', () => {
		store.addUser('alice', 'c1', 'Alice');

		// Verify user exists
		expect(store.hasUser('c1')).toBe(true);

		// Remove user (should clear timeout)
		store.removeUser('c1');

		// Verify user is gone
		expect(store.hasUser('c1')).toBe(false);

		// Advance time - should not affect removed user
		vi.advanceTimersByTime(5000);

		expect(store.getUserCount()).toBe(0);
	});

	it('should maintain presence list consistency', () => {
		const userIds = Array.from({ length: 10 }, (_, i) => `user${i}`);

		// Add all users
		userIds.forEach((id, i) => {
			store.addUser(id, `c${i}`, id);
		});

		expect(store.getUserCount()).toBe(10);

		// Verify all users are active
		let users = store.getUsers();
		expect(users.every((u) => u.status === 'active')).toBe(true);

		// Some users become idle
		vi.advanceTimersByTime(5000);

		users = store.getUsers();
		expect(users.every((u) => u.status === 'idle')).toBe(true);

		// Remove every other user
		for (let i = 0; i < 10; i += 2) {
			store.removeUser(`c${i}`);
		}

		expect(store.getUserCount()).toBe(5);

		// Remaining users are still in store
		users = store.getUsers();
		expect(users.every((u) => u.clientId.includes('1') || u.clientId.includes('3') || u.clientId.includes('5') || u.clientId.includes('7') || u.clientId.includes('9'))).toBe(true);
	});

	it('should handle store subscription updates', () => {
		// Use object wrapper to avoid TypeScript control-flow narrowing to `never`
		const stateRef: { current: Map<string, OnlineUser> | null } = { current: null };

		const unsubscribe = store.users.subscribe((state: Map<string, OnlineUser>) => {
			stateRef.current = new Map(state);
		});

		store.addUser('alice', 'c1', 'Alice');

		expect(stateRef.current?.size).toBe(1);
		expect(stateRef.current?.has('c1')).toBe(true);

		store.addUser('bob', 'c2', 'Bob');

		expect(stateRef.current?.size).toBe(2);

		store.removeUser('c1');

		expect(stateRef.current?.size).toBe(1);
		expect(stateRef.current?.has('c1')).toBe(false);

		unsubscribe();
	});
});
