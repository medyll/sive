/**
 * leaderboardQueries — In-memory leaderboard store + ranking logic
 *
 * Users submit their stats when viewing the leaderboard (opt-in).
 * All data is ephemeral (in-memory, resets on server restart).
 */

export interface LeaderboardEntry {
	userId: string;
	displayName: string; // Real name or @anonXXXX depending on privacy
	weeklyWords: number;
	currentStreak: number;
	totalWords: number;
	weekStart: string; // YYYY-MM-DD
	submittedAt: string;
}

export interface RankedEntry extends LeaderboardEntry {
	rank: number;
}

// In-memory store: userId → entry
const weeklyStore = new Map<string, LeaderboardEntry>();

/** Generate consistent anonymous display name from userId */
function anonymize(userId: string): string {
	let hash = 0;
	for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
	return `@anon${Math.abs(hash) % 9999}`;
}

/** Get current week start (Monday UTC) */
export function getCurrentWeekStart(): string {
	const d = new Date();
	const day = d.getUTCDay();
	const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
	d.setUTCDate(diff);
	return d.toISOString().slice(0, 10);
}

/**
 * Submit or update a user's weekly stats.
 * Call when user opts in to leaderboard visibility.
 */
export function submitWeeklyStats(
	userId: string,
	stats: { weeklyWords: number; currentStreak: number; totalWords: number },
	showReal: boolean,
	realName: string
): void {
	const entry: LeaderboardEntry = {
		userId,
		displayName: showReal ? realName : anonymize(userId),
		weeklyWords: stats.weeklyWords,
		currentStreak: stats.currentStreak,
		totalWords: stats.totalWords,
		weekStart: getCurrentWeekStart(),
		submittedAt: new Date().toISOString()
	};
	weeklyStore.set(userId, entry);
}

/**
 * Get top N entries by weekly words written.
 * Tie-breaker: streak → total words → submission time (oldest first).
 */
export function getWeeklyTopN(n = 10): RankedEntry[] {
	const currentWeek = getCurrentWeekStart();

	return [...weeklyStore.values()]
		.filter((e) => e.weekStart === currentWeek)
		.sort((a, b) => {
			if (b.weeklyWords !== a.weeklyWords) return b.weeklyWords - a.weeklyWords;
			if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
			if (b.totalWords !== a.totalWords) return b.totalWords - a.totalWords;
			return a.submittedAt.localeCompare(b.submittedAt); // Earlier = better
		})
		.slice(0, n)
		.map((entry, i) => ({ ...entry, rank: i + 1 }));
}

/**
 * Get a user's current rank in the weekly leaderboard.
 * Returns null if user hasn't submitted stats.
 */
export function getUserWeeklyRank(userId: string): { rank: number; total: number } | null {
	const currentWeek = getCurrentWeekStart();
	const sorted = getWeeklyTopN(Infinity as unknown as number);
	const idx = sorted.findIndex((e) => e.userId === userId);
	if (idx === -1) return null;
	return { rank: idx + 1, total: sorted.length };
}

/**
 * Get top N entries by all-time streak (desc).
 * Tie-breaker: total words → submission time.
 */
export function getAllTimeTopByStreak(n = 10): RankedEntry[] {
	return [...weeklyStore.values()]
		.sort((a, b) => {
			if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
			if (b.totalWords !== a.totalWords) return b.totalWords - a.totalWords;
			return a.submittedAt.localeCompare(b.submittedAt);
		})
		.slice(0, n)
		.map((entry, i) => ({ ...entry, rank: i + 1 }));
}

/**
 * Get top N entries by all-time total words (desc).
 * Tie-breaker: streak → submission time.
 */
export function getAllTimeTopByWords(n = 10): RankedEntry[] {
	return [...weeklyStore.values()]
		.sort((a, b) => {
			if (b.totalWords !== a.totalWords) return b.totalWords - a.totalWords;
			if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
			return a.submittedAt.localeCompare(b.submittedAt);
		})
		.slice(0, n)
		.map((entry, i) => ({ ...entry, rank: i + 1 }));
}

/** Get user's all-time rank (by streak) */
export function getUserAlltimeRank(userId: string): { streakRank: number; wordsRank: number; total: number } | null {
	const byStreak = getAllTimeTopByStreak(Infinity as unknown as number);
	const byWords = getAllTimeTopByWords(Infinity as unknown as number);
	const sIdx = byStreak.findIndex((e) => e.userId === userId);
	const wIdx = byWords.findIndex((e) => e.userId === userId);
	if (sIdx === -1) return null;
	return { streakRank: sIdx + 1, wordsRank: wIdx + 1, total: byStreak.length };
}

/** Remove a user from the leaderboard (privacy opt-out) */
export function removeFromLeaderboard(userId: string): void {
	weeklyStore.delete(userId);
}

/** Reset store (for testing) */
export function __resetLeaderboard(): void {
	weeklyStore.clear();
}
