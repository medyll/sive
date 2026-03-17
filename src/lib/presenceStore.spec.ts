import { describe, it, expect } from 'vitest';

// Test presence store logic (idle detection, cleanup)
const IDLE_TIMEOUT_MS = 30_000;
const OFFLINE_TIMEOUT_MS = 120_000;

interface ActiveUser {
	userId: string;
	name?: string;
	status: 'active' | 'idle' | 'offline';
	lastSeen: number;
}

function processPresence(users: ActiveUser[], now: number): ActiveUser[] {
	return users.map((u) => {
		const idleTime = now - u.lastSeen;
		const newStatus: ActiveUser['status'] =
			idleTime > OFFLINE_TIMEOUT_MS ? 'offline' : idleTime > IDLE_TIMEOUT_MS ? 'idle' : 'active';
		return { ...u, status: newStatus };
	});
}

describe('Presence store idle detection', () => {
	const baseTime = Date.now();

	it('marks user as active if seen within idle timeout', () => {
		const users: ActiveUser[] = [
			{ userId: 'u1', name: 'Alice', status: 'active', lastSeen: baseTime - 10_000 }
		];
		const processed = processPresence(users, baseTime);
		expect(processed[0].status).toBe('active');
	});

	it('marks user as idle after 30s without activity', () => {
		const users: ActiveUser[] = [
			{ userId: 'u1', name: 'Alice', status: 'active', lastSeen: baseTime - 35_000 }
		];
		const processed = processPresence(users, baseTime);
		expect(processed[0].status).toBe('idle');
	});

	it('marks user as offline after 2 minutes without activity', () => {
		const users: ActiveUser[] = [
			{ userId: 'u1', name: 'Alice', status: 'active', lastSeen: baseTime - 130_000 }
		];
		const processed = processPresence(users, baseTime);
		expect(processed[0].status).toBe('offline');
	});

	it('handles multiple users with different statuses', () => {
		const users: ActiveUser[] = [
			{ userId: 'u1', status: 'active', lastSeen: baseTime - 5_000 },
			{ userId: 'u2', status: 'active', lastSeen: baseTime - 40_000 },
			{ userId: 'u3', status: 'active', lastSeen: baseTime - 150_000 }
		];
		const processed = processPresence(users, baseTime);
		expect(processed[0].status).toBe('active');
		expect(processed[1].status).toBe('idle');
		expect(processed[2].status).toBe('offline');
	});

	it('filters out offline users on cleanup', () => {
		const users: ActiveUser[] = [
			{ userId: 'u1', status: 'active', lastSeen: baseTime - 10_000 },
			{ userId: 'u2', status: 'offline', lastSeen: baseTime - 150_000 }
		];
		const processed = processPresence(users, baseTime);
		const active = processed.filter((u) => u.status !== 'offline');
		expect(active.length).toBe(1);
		expect(active[0].userId).toBe('u1');
	});
});
