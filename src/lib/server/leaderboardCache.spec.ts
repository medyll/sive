import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCachedWeeklyTop, invalidateWeeklyCache, __resetCache } from './leaderboardCache';
import { submitWeeklyStats, __resetLeaderboard } from './leaderboardQueries';

describe('leaderboardCache', () => {
	beforeEach(() => {
		__resetCache();
		__resetLeaderboard();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should fetch and cache results', () => {
		submitWeeklyStats('u1', { weeklyWords: 5000, currentStreak: 5, totalWords: 50000 }, false, '');

		const result1 = getCachedWeeklyTop();
		const result2 = getCachedWeeklyTop();

		expect(result1.data).toHaveLength(1);
		expect(result1.fresh).toBe(false); // First fetch is not cached
		expect(result2.fresh).toBe(true);  // Second uses cache
	});

	it('should return stale cache after TTL with force=false', () => {
		submitWeeklyStats('u1', { weeklyWords: 5000, currentStreak: 5, totalWords: 50000 }, false, '');
		getCachedWeeklyTop(); // Prime cache

		// Advance 30 min — still fresh
		vi.advanceTimersByTime(30 * 60 * 1000);
		const result = getCachedWeeklyTop();
		expect(result.fresh).toBe(true);
	});

	it('should refetch after TTL expires', () => {
		submitWeeklyStats('u1', { weeklyWords: 5000, currentStreak: 5, totalWords: 50000 }, false, '');
		getCachedWeeklyTop(); // Prime cache

		// Advance 61 min — cache expired
		vi.advanceTimersByTime(61 * 60 * 1000);
		const result = getCachedWeeklyTop();
		expect(result.fresh).toBe(false); // Re-fetched
	});

	it('should bypass cache with force=true', () => {
		getCachedWeeklyTop(); // Prime cache
		const result = getCachedWeeklyTop(10, true);
		expect(result.fresh).toBe(false); // Force-fetched
	});

	it('should invalidate cache', () => {
		getCachedWeeklyTop(); // Prime cache
		invalidateWeeklyCache();
		const result = getCachedWeeklyTop();
		expect(result.fresh).toBe(false); // Re-fetched after invalidation
	});

	it('should include cachedAt timestamp', () => {
		const result = getCachedWeeklyTop();
		expect(result.cachedAt).toBeGreaterThan(0);
	});
});
