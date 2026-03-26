/**
 * leaderboardCache — 1-hour TTL cache for leaderboard data
 *
 * Prevents redundant ranking queries on every page load.
 * Manually invalidated on stat submission or explicit refresh.
 */

import { getWeeklyTopN, type RankedEntry } from './leaderboardQueries';

const TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
	data: RankedEntry[];
	cachedAt: number; // timestamp
}

let weeklyCache: CacheEntry | null = null;

/**
 * Get weekly top 10, using cache if fresh (< 1 hour old).
 */
export function getCachedWeeklyTop(n = 10, force = false): { data: RankedEntry[]; cachedAt: number; fresh: boolean } {
	const now = Date.now();

	if (!force && weeklyCache && now - weeklyCache.cachedAt < TTL_MS) {
		return { data: weeklyCache.data, cachedAt: weeklyCache.cachedAt, fresh: true };
	}

	const data = getWeeklyTopN(n);
	weeklyCache = { data, cachedAt: now };
	return { data, cachedAt: now, fresh: false };
}

/**
 * Invalidate the weekly cache (call on stat submission).
 */
export function invalidateWeeklyCache(): void {
	weeklyCache = null;
}

/** Reset for testing */
export function __resetCache(): void {
	weeklyCache = null;
}
