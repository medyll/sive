/**
 * leaderboardStore — client-side state for all leaderboard views
 */

export interface LeaderboardEntry {
	rank: number;
	userId: string;
	displayName: string;
	weeklyWords: number;
	currentStreak: number;
	totalWords: number;
	weekStart: string;
}

export interface UserRank {
	rank: number;
	total: number;
}

export interface AlltimeUserRank {
	streakRank: number;
	wordsRank: number;
	total: number;
}

interface ViewState {
	entries: LeaderboardEntry[];
	loading: boolean;
	error: string | null;
	cachedAt: string | null;
}

interface LeaderboardState {
	weekly: ViewState & { userRank: UserRank | null };
	alltime: ViewState & {
		userRank: AlltimeUserRank | null;
		streak: { entries: LeaderboardEntry[] };
		words: { entries: LeaderboardEntry[] };
	};
}

function emptyView(): ViewState {
	return { entries: [], loading: false, error: null, cachedAt: null };
}

function createLeaderboardStore() {
	let state = $state<LeaderboardState>({
		weekly: { ...emptyView(), userRank: null },
		alltime: {
			...emptyView(),
			userRank: null,
			streak: { entries: [] },
			words: { entries: [] }
		}
	});

	async function fetchWeekly(force = false) {
		state.weekly.loading = true;
		state.weekly.error = null;
		try {
			const res = await fetch(`/api/leaderboard/weekly${force ? '?refresh=true' : ''}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			state.weekly.entries = data.entries;
			state.weekly.userRank = data.userRank;
			state.weekly.cachedAt = data.cachedAt;
		} catch (e) {
			state.weekly.error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			state.weekly.loading = false;
		}
	}

	async function fetchAlltime(view: 'streak' | 'words', force = false) {
		state.alltime.loading = true;
		state.alltime.error = null;
		try {
			const params = new URLSearchParams({ view });
			if (force) params.set('refresh', 'true');
			const res = await fetch(`/api/leaderboard/alltime?${params}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			state.alltime[view] = { entries: data.entries };
			state.alltime.userRank = data.userRank;
			state.alltime.cachedAt = new Date().toISOString();
		} catch (e) {
			state.alltime.error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			state.alltime.loading = false;
		}
	}

	async function submitStats(stats: {
		weeklyWords: number;
		currentStreak: number;
		totalWords: number;
		showReal: boolean;
		displayName: string;
	}) {
		try {
			await fetch('/api/leaderboard/weekly', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(stats)
			});
			await fetchWeekly(true);
		} catch {
			// Non-critical
		}
	}

	const cacheAge = $derived(
		state.weekly.cachedAt
			? Math.floor((Date.now() - new Date(state.weekly.cachedAt).getTime()) / 60_000)
			: null
	);

	return {
		get state() { return state; },
		get cacheAge() { return cacheAge; },
		fetchWeekly,
		fetchAlltime,
		submitStats
	};
}

export const leaderboardStore = createLeaderboardStore();
