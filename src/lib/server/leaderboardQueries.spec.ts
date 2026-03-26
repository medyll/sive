import { describe, it, expect, beforeEach } from 'vitest';
import {
	submitWeeklyStats,
	getWeeklyTopN,
	getUserWeeklyRank,
	removeFromLeaderboard,
	getCurrentWeekStart,
	__resetLeaderboard
} from './leaderboardQueries';

describe('leaderboardQueries', () => {
	beforeEach(() => {
		__resetLeaderboard();
	});

	it('should return empty list when no entries', () => {
		expect(getWeeklyTopN()).toHaveLength(0);
	});

	it('should submit and retrieve weekly stats', () => {
		submitWeeklyStats('user-1', { weeklyWords: 5000, currentStreak: 7, totalWords: 50000 }, false, '@user1');
		const top = getWeeklyTopN();
		expect(top).toHaveLength(1);
		expect(top[0].weeklyWords).toBe(5000);
		expect(top[0].rank).toBe(1);
	});

	it('should anonymize display name when showReal is false', () => {
		submitWeeklyStats('user-abc', { weeklyWords: 1000, currentStreak: 3, totalWords: 10000 }, false, 'Alice');
		const top = getWeeklyTopN();
		expect(top[0].displayName).toMatch(/^@anon\d+$/);
		expect(top[0].displayName).not.toBe('Alice');
	});

	it('should use real name when showReal is true', () => {
		submitWeeklyStats('user-abc', { weeklyWords: 1000, currentStreak: 3, totalWords: 10000 }, true, 'Alice');
		const top = getWeeklyTopN();
		expect(top[0].displayName).toBe('Alice');
	});

	it('should rank by weekly words descending', () => {
		submitWeeklyStats('u1', { weeklyWords: 3000, currentStreak: 1, totalWords: 3000 }, false, '');
		submitWeeklyStats('u2', { weeklyWords: 7000, currentStreak: 1, totalWords: 7000 }, false, '');
		submitWeeklyStats('u3', { weeklyWords: 5000, currentStreak: 1, totalWords: 5000 }, false, '');
		const top = getWeeklyTopN();
		expect(top[0].weeklyWords).toBe(7000);
		expect(top[1].weeklyWords).toBe(5000);
		expect(top[2].weeklyWords).toBe(3000);
	});

	it('should break ties by streak', () => {
		submitWeeklyStats('u1', { weeklyWords: 5000, currentStreak: 10, totalWords: 10000 }, false, '');
		submitWeeklyStats('u2', { weeklyWords: 5000, currentStreak: 3, totalWords: 10000 }, false, '');
		const top = getWeeklyTopN();
		expect(top[0].userId).toBe('u1'); // Higher streak wins
	});

	it('should limit to N entries', () => {
		for (let i = 0; i < 20; i++) {
			submitWeeklyStats(`u${i}`, { weeklyWords: i * 100, currentStreak: i, totalWords: i * 1000 }, false, '');
		}
		expect(getWeeklyTopN(10)).toHaveLength(10);
	});

	it('should return user rank', () => {
		submitWeeklyStats('u1', { weeklyWords: 9000, currentStreak: 10, totalWords: 90000 }, false, '');
		submitWeeklyStats('u2', { weeklyWords: 5000, currentStreak: 5, totalWords: 50000 }, false, '');
		submitWeeklyStats('u3', { weeklyWords: 2000, currentStreak: 2, totalWords: 20000 }, false, '');

		const rank = getUserWeeklyRank('u2');
		expect(rank).not.toBeNull();
		expect(rank?.rank).toBe(2);
		expect(rank?.total).toBe(3);
	});

	it('should return null rank for user not on board', () => {
		expect(getUserWeeklyRank('nonexistent')).toBeNull();
	});

	it('should remove user from leaderboard', () => {
		submitWeeklyStats('u1', { weeklyWords: 5000, currentStreak: 5, totalWords: 50000 }, false, '');
		removeFromLeaderboard('u1');
		expect(getWeeklyTopN()).toHaveLength(0);
		expect(getUserWeeklyRank('u1')).toBeNull();
	});

	it('should generate consistent week start', () => {
		const week = getCurrentWeekStart();
		expect(week).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		// Should be a Monday (day 1 in UTC)
		const d = new Date(week + 'T00:00:00Z');
		expect(d.getUTCDay()).toBe(1);
	});

	it('should update existing entry on re-submit', () => {
		submitWeeklyStats('u1', { weeklyWords: 1000, currentStreak: 1, totalWords: 1000 }, false, '');
		submitWeeklyStats('u1', { weeklyWords: 8000, currentStreak: 5, totalWords: 8000 }, false, '');
		const top = getWeeklyTopN();
		expect(top).toHaveLength(1);
		expect(top[0].weeklyWords).toBe(8000);
	});
});
