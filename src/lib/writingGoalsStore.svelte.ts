/**
 * Writing goals — daily word target, session progress, streak tracking
 */

const STORAGE_KEY = 'sive:goals';
const SESSION_KEY = 'sive:goals:session';

export interface WritingGoals {
	dailyTarget: number;        // words per day
	sessionStart: number;       // words at session open
	todayWords: number;         // accumulated today
	lastWrittenDate: string;    // YYYY-MM-DD
	streak: number;             // consecutive days
	longestStreak: number;
}

const DEFAULT: WritingGoals = {
	dailyTarget: 500,
	sessionStart: 0,
	todayWords: 0,
	lastWrittenDate: '',
	streak: 0,
	longestStreak: 0
};

function today() {
	return new Date().toISOString().slice(0, 10);
}

function load(): WritingGoals {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		return { ...DEFAULT, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
	} catch { return { ...DEFAULT }; }
}

function save(g: WritingGoals) {
	if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
}

function createGoalsStore() {
	let goals = $state<WritingGoals>(load());

	function setDailyTarget(n: number) {
		goals = { ...goals, dailyTarget: Math.max(1, Math.min(100_000, n)) };
		save(goals);
	}

	function recordWords(wordCount: number) {
		const t = today();
		let { todayWords, lastWrittenDate, streak, longestStreak } = goals;

		if (lastWrittenDate === t) {
			// Same day — update count
			todayWords = Math.max(todayWords, wordCount);
		} else {
			// New day
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yd = yesterday.toISOString().slice(0, 10);
			streak = lastWrittenDate === yd ? streak + 1 : 1;
			longestStreak = Math.max(longestStreak, streak);
			todayWords = wordCount;
			lastWrittenDate = t;
		}

		goals = { ...goals, todayWords, lastWrittenDate, streak, longestStreak };
		save(goals);
	}

	function reset() {
		goals = { ...DEFAULT };
		save(goals);
	}

	const progress = $derived(
		goals.dailyTarget > 0 ? Math.min(1, goals.todayWords / goals.dailyTarget) : 0
	);
	const goalMet = $derived(goals.todayWords >= goals.dailyTarget);
	const remaining = $derived(Math.max(0, goals.dailyTarget - goals.todayWords));

	return {
		get goals() { return goals; },
		get progress() { return progress; },
		get goalMet() { return goalMet; },
		get remaining() { return remaining; },
		setDailyTarget,
		recordWords,
		reset
	};
}

export const goalsStore = createGoalsStore();
