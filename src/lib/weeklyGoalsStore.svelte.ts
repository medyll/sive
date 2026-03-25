/**
 * Weekly Goals Store — tracks weekly writing progress and historical data.
 *
 * Records completed weeks, total words per week, and streaks of weeks
 * where daily goals were consistently met.
 *
 * Week starts on Monday, resets at midnight UTC.
 */

const STORAGE_KEY = 'sive:weekly-goals';

export interface WeeklyGoalData {
	/** Week start date (Monday) in YYYY-MM-DD */
	weekStart: string;
	/** Total words written in the week */
	totalWords: number;
	/** Number of days goal was met */
	daysGoalMet: number;
	/** Total days of activity */
	daysActive: number;
	/** Daily word counts for the week (Mon-Sun) */
	dailyCounts: number[];
	/** Completion percentage (0-1) */
	completion: number;
}

export interface WeeklyGoalsState {
	/** History of completed weeks */
	history: WeeklyGoalData[];
	/** Current week's data (not yet completed) */
	currentWeek: WeeklyGoalData | null;
	/** Weeks with perfect daily goal completion */
	perfectWeeks: number;
	/** Best week so far (total words) */
	bestWeek: WeeklyGoalData | null;
}

const DEFAULT: WeeklyGoalsState = {
	history: [],
	currentWeek: null,
	perfectWeeks: 0,
	bestWeek: null
};

function getWeekStart(date: Date = new Date()): string {
	const d = new Date(date);
	const day = d.getUTCDay();
	const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
	d.setUTCDate(diff);
	return d.toISOString().slice(0, 10);
}

function load(): WeeklyGoalsState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		return saved ? { ...DEFAULT, ...JSON.parse(saved) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(state: WeeklyGoalsState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function createWeeklyGoalsStore() {
	let state = $state<WeeklyGoalsState>(load());

	/**
	 * Record daily progress (called once per day or when syncing)
	 */
	function recordDailyProgress(date: string, wordCount: number, dailyTarget: number): void {
		const weekStart = getWeekStart(new Date(date));
		const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
		const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-6 (Mon-Sun)

		// Find or create current week
		if (!state.currentWeek || state.currentWeek.weekStart !== weekStart) {
			// Week changed — save current week to history and create new one
			if (state.currentWeek) {
				state.history = [...state.history, state.currentWeek];
				if (state.currentWeek.daysGoalMet === 7) {
					state.perfectWeeks++;
				}
				if (!state.bestWeek || state.currentWeek.totalWords > state.bestWeek.totalWords) {
					state.bestWeek = state.currentWeek;
				}
			}
			state.currentWeek = {
				weekStart,
				totalWords: 0,
				daysGoalMet: 0,
				daysActive: 0,
				dailyCounts: [0, 0, 0, 0, 0, 0, 0],
				completion: 0
			};
		}

		// Update current week with new data
		if (state.currentWeek) {
			state.currentWeek.dailyCounts[dayIndex] = wordCount;
			state.currentWeek.totalWords = state.currentWeek.dailyCounts.reduce((a, b) => a + b, 0);
			state.currentWeek.daysActive = state.currentWeek.dailyCounts.filter(c => c > 0).length;
			state.currentWeek.daysGoalMet = state.currentWeek.dailyCounts.filter(c => c >= dailyTarget).length;
			state.currentWeek.completion = state.currentWeek.daysGoalMet / 7;
		}

		save(state);
	}

	/**
	 * Get weeks where all 7 days had goal met
	 */
	function getPerfectWeeks(): WeeklyGoalData[] {
		return state.history.filter(w => w.daysGoalMet === 7);
	}

	/**
	 * Get top N weeks by total words
	 */
	function getTopWeeks(n: number = 4): WeeklyGoalData[] {
		const allWeeks = state.bestWeek ? [state.bestWeek, ...state.history] : state.history;
		return [...allWeeks]
			.sort((a, b) => b.totalWords - a.totalWords)
			.slice(0, n);
	}

	/**
	 * Get last N weeks (most recent first)
	 */
	function getRecentWeeks(n: number = 4): WeeklyGoalData[] {
		return [...state.history].reverse().slice(0, n);
	}

	/**
	 * Calculate average words per day across all weeks
	 */
	function getAverageWordsPerDay(): number {
		if (state.history.length === 0) return 0;
		const total = state.history.reduce((sum, w) => sum + w.totalWords, 0);
		return Math.round(total / (state.history.length * 7));
	}

	/**
	 * Reset data (e.g., on user request or app reset)
	 */
	function reset(): void {
		state = { ...DEFAULT };
		save(state);
	}

	return {
		get state() {
			return state;
		},
		get history() {
			return state.history;
		},
		get currentWeek() {
			return state.currentWeek;
		},
		get perfectWeeks() {
			return state.perfectWeeks;
		},
		get bestWeek() {
			return state.bestWeek;
		},
		recordDailyProgress,
		getPerfectWeeks,
		getTopWeeks,
		getRecentWeeks,
		getAverageWordsPerDay,
		reset
	};
}

export const weeklyGoalsStore = createWeeklyGoalsStore();
