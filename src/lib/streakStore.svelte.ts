/**
 * streakStore — daily writing activity tracker with streak calculation.
 *
 * Records write events per day, calculates current/longest streaks,
 * and provides activity history for the Goals Dashboard.
 *
 * Activity is tracked in UTC for consistency across timezones.
 */

import { activityStore } from './activityStore.svelte';
import { notificationStore } from './notificationStore.svelte';

const REMINDER_KEY = 'sive:streak:lastReminder';

const STREAK_MILESTONES = [7, 30, 100, 365];
const STORAGE_KEY = 'sive:streak';

export interface StreakData {
	/** Map of YYYY-MM-DD → list of timestamps when user wrote */
	activity: Record<string, number[]>;
	/** Current consecutive days with activity */
	currentStreak: number;
	/** Longest streak ever achieved */
	longestStreak: number;
	/** Last date user had activity */
	lastActiveDate: string; // YYYY-MM-DD
}

const DEFAULT: StreakData = {
	activity: {},
	currentStreak: 0,
	longestStreak: 0,
	lastActiveDate: ''
};

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

function load(): StreakData {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(data: StreakData): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}
}

/**
 * Calculate streak based on activity history.
 * A streak is broken if there's a gap of more than 1 day.
 */
function calculateStreak(activity: Record<string, number[]>, lastActiveDate: string): number {
	if (!lastActiveDate || !activity[lastActiveDate]) return 0;

	let streak = 1;
	const dates = Object.keys(activity).sort().reverse();
	const lastIdx = dates.indexOf(lastActiveDate);

	if (lastIdx === -1) return 0;

	for (let i = lastIdx + 1; i < dates.length; i++) {
		const curr = new Date(dates[i - 1]);
		const prev = new Date(dates[i]);
		const dayDiff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

		if (dayDiff === 1) {
			streak++;
		} else {
			break;
		}
	}

	return streak;
}

function createStreakStore() {
	let data = $state<StreakData>(load());

	/**
	 * Record a write event for today.
	 * Called when user saves/writes to a document.
	 */
	function recordActivity(): void {
		const t = today();
		const now = Date.now();

		if (!data.activity[t]) {
			data.activity[t] = [];
		}
		data.activity[t].push(now);

		// Update streak if this is a new day
		if (data.lastActiveDate !== t) {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yd = yesterday.toISOString().slice(0, 10);

			if (data.lastActiveDate === yd) {
				// Consecutive day — increment streak
				data.currentStreak++;
			} else {
				// Gap detected — reset to 1
				data.currentStreak = 1;
			}

			data.lastActiveDate = t;
			const prevLongest = data.longestStreak;
			data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

			// Emit streak milestone on milestone days (fire-and-forget)
			if (STREAK_MILESTONES.includes(data.currentStreak)) {
				queueMicrotask(() => {
					activityStore.emit('streak_milestone', 'self', 'me', { days: data.currentStreak });
				});
			}
		}

		save(data);
	}

	/**
	 * Get activity count for a specific date.
	 */
	function getActivityCount(date: string): number {
		return data.activity[date]?.length ?? 0;
	}

	/**
	 * Get all activity timestamps for a date.
	 */
	function getActivityForDate(date: string): number[] {
		return data.activity[date] ?? [];
	}

	/**
	 * Check if user had activity on a date.
	 */
	function hasActivityOn(date: string): boolean {
		return (data.activity[date]?.length ?? 0) > 0;
	}

	/**
	 * Get last N days of activity (for dashboard heatmap/calendar view).
	 */
	function getActivityWindow(days: number = 30): Record<string, number> {
		const result: Record<string, number> = {};
		const now = new Date();

		for (let i = 0; i < days; i++) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().slice(0, 10);
			result[dateStr] = getActivityCount(dateStr);
		}

		return result;
	}

	/**
	 * Reset streak (e.g., on user request or at application reset).
	 */
	function reset(): void {
		data = { ...DEFAULT };
		save(data);
	}

	// Streak reminder: fire once per day after 8pm if no activity today
	if (typeof localStorage !== 'undefined' && data.currentStreak > 0) {
		const t = today();
		const lastReminder = localStorage.getItem(REMINDER_KEY);
		const hour = new Date().getHours();
		if (hour >= 20 && lastReminder !== t && !hasActivityOn(t)) {
			queueMicrotask(() => {
				notificationStore.notify(
					'streak_reminder',
					`🔥 Don't break your ${data.currentStreak}-day streak! Write something today.`
				);
				localStorage.setItem(REMINDER_KEY, t);
			});
		}
	}

	// Derived values
	const isActiveToday = $derived(hasActivityOn(today()));
	const dailyActivityCount = $derived(getActivityCount(today()));

	return {
		get data() {
			return data;
		},
		get isActiveToday() {
			return isActiveToday;
		},
		get dailyActivityCount() {
			return dailyActivityCount;
		},
		recordActivity,
		getActivityCount,
		getActivityForDate,
		hasActivityOn,
		getActivityWindow,
		reset
	};
}

export const streakStore = createStreakStore();
