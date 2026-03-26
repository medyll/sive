import { describe, it, expect, beforeEach, vi } from 'vitest';
import { activityStore } from './activityStore.svelte';

global.localStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('activityStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		activityStore.reset();
	});

	it('should start empty', () => {
		expect(activityStore.count).toBe(0);
		expect(activityStore.state.events).toHaveLength(0);
	});

	it('should emit a badge_earned event', () => {
		const ev = activityStore.emit('badge_earned', 'u1', '@alice', { badgeId: 'streak-7', badgeName: '7-Day Streak' });

		expect(ev.id).toBeDefined();
		expect(ev.type).toBe('badge_earned');
		expect(ev.userId).toBe('u1');
		expect(ev.displayName).toBe('@alice');
		expect(ev.payload.badgeId).toBe('streak-7');
		expect(activityStore.count).toBe(1);
	});

	it('should emit a streak_milestone event', () => {
		activityStore.emit('streak_milestone', 'u1', '@alice', { days: 30 });
		const events = activityStore.getByType('streak_milestone');
		expect(events).toHaveLength(1);
		expect(events[0].payload.days).toBe(30);
	});

	it('should prepend new events (newest first)', () => {
		activityStore.emit('badge_earned', 'u1', '@a', { badgeId: 'first' });
		activityStore.emit('streak_milestone', 'u1', '@a', { days: 7 });

		expect(activityStore.state.events[0].type).toBe('streak_milestone');
		expect(activityStore.state.events[1].type).toBe('badge_earned');
	});

	it('should cap at MAX_EVENTS (100) and drop oldest', () => {
		for (let i = 0; i < 110; i++) {
			activityStore.emit('goal_completed', `u${i}`, `@u${i}`, { words: i * 100 });
		}
		expect(activityStore.count).toBe(100);
		// Newest event is for u109
		expect(activityStore.state.events[0].userId).toBe('u109');
	});

	it('should filter by user', () => {
		activityStore.emit('badge_earned', 'u1', '@alice', {});
		activityStore.emit('badge_earned', 'u2', '@bob', {});
		activityStore.emit('streak_milestone', 'u1', '@alice', { days: 7 });

		const u1Events = activityStore.getByUser('u1');
		expect(u1Events).toHaveLength(2);
		expect(u1Events.every((e) => e.userId === 'u1')).toBe(true);
	});

	it('should filter by type', () => {
		activityStore.emit('badge_earned', 'u1', '@alice', {});
		activityStore.emit('streak_milestone', 'u1', '@alice', { days: 7 });
		activityStore.emit('badge_earned', 'u2', '@bob', {});

		const badges = activityStore.getByType('badge_earned');
		expect(badges).toHaveLength(2);
		expect(badges.every((e) => e.type === 'badge_earned')).toBe(true);
	});

	it('should filter events since timestamp', () => {
		const before = Date.now() - 10000;
		activityStore.emit('badge_earned', 'u1', '@alice', {});
		activityStore.emit('streak_milestone', 'u2', '@bob', { days: 30 });

		const recent = activityStore.getSince(before);
		expect(recent).toHaveLength(2);

		const future = activityStore.getSince(Date.now() + 10000);
		expect(future).toHaveLength(0);
	});

	it('should persist to localStorage on emit', () => {
		activityStore.emit('goal_completed', 'u1', '@alice', { words: 500 });
		expect(localStorage.setItem).toHaveBeenCalled();
	});

	it('should reset all events', () => {
		activityStore.emit('badge_earned', 'u1', '@alice', {});
		activityStore.reset();
		expect(activityStore.count).toBe(0);
	});

	it('should include timestamp on each event', () => {
		const before = Date.now();
		activityStore.emit('leaderboard_entry', 'u1', '@alice', { rank: 3 });
		const after = Date.now();

		const ev = activityStore.state.events[0];
		expect(ev.timestamp).toBeGreaterThanOrEqual(before);
		expect(ev.timestamp).toBeLessThanOrEqual(after);
	});

	it('should generate unique IDs', () => {
		activityStore.emit('badge_earned', 'u1', '@a', {});
		activityStore.emit('badge_earned', 'u1', '@a', {});
		const [e1, e2] = activityStore.state.events;
		expect(e1.id).not.toBe(e2.id);
	});
});
