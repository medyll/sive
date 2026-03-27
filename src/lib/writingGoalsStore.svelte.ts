/**
 * Writing goals — daily word target, session progress, streak tracking
 */

import { activityStore } from './activityStore.svelte';
import { challengeStore } from './challengeStore.svelte';

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

		const prevWords = goals.todayWords;
		const wasGoalMet = prevWords >= goals.dailyTarget;
		goals = { ...goals, todayWords, lastWrittenDate, streak, longestStreak };
		save(goals);

		// S69-05: Contribute new words to joined challenges (fire-and-forget)
		const delta = goals.todayWords - prevWords;
		if (delta > 0) {
			queueMicrotask(() => {
				for (const id of challengeStore.state.joined) {
					const prevProgress = challengeStore.getProgress(id);
					challengeStore.addWords(id, delta);
					
					// S69-05: Emit challenge_progress at milestones (25%, 50%, 75%, 100%)
					const newProgress = challengeStore.getProgress(id);
					const challenge = challengeStore.state.available.find((c) => c.id === id);
					if (newProgress && challenge && challenge.targetWords > 0) {
						const prevPct = prevProgress 
							? Math.floor((prevProgress.wordsContributed / challenge.targetWords) * 100)
							: 0;
						const newPct = Math.floor((newProgress.wordsContributed / challenge.targetWords) * 100);
						
						// Check for milestone crossings
						const milestones = [25, 50, 75, 100];
						for (const milestone of milestones) {
							if (prevPct < milestone && newPct >= milestone) {
								activityStore.emit(
									'challenge_progress',
									'self',
									'me',
									{
										challengeId: id,
										challengeTitle: challenge.title,
										milestone,
										wordsContributed: newProgress.wordsContributed,
										targetWords: challenge.targetWords
									}
								);
							}
						}
					}
				}
			});
		}

		// Emit goal_completed when target first crossed (fire-and-forget)
		const isNowMet = goals.todayWords >= goals.dailyTarget;
		if (isNowMet && !wasGoalMet) {
			queueMicrotask(() => {
				activityStore.emit('goal_completed', 'self', 'me', { words: goals.todayWords });
			});
		}
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
