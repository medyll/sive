/**
 * challengeStore — community writing challenges
 *
 * Challenges are created locally and shared via in-memory server.
 * Users can join/leave challenges and track their progress.
 */

import { notificationStore } from './notificationStore.svelte';

const STORAGE_KEY = 'sive:challenges';
const DEADLINE_REMINDER_KEY = 'sive:challenges:deadlineReminders';

export interface Challenge {
	id: string;
	title: string;
	description: string;
	targetWords: number;
	durationDays: number;
	createdAt: string;
	endsAt: string;
	creatorId: string;
}

export interface ChallengeProgress {
	challengeId: string;
	joinedAt: string;
	wordsContributed: number;
}

export interface ChallengeState {
	available: Challenge[];
	joined: string[]; // challenge IDs
	progress: Record<string, ChallengeProgress>;
}

const DEFAULT: ChallengeState = {
	available: [],
	joined: [],
	progress: {}
};

function load(): ChallengeState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT, available: [], joined: [], progress: {} };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...DEFAULT, available: [], joined: [], progress: {} };
		const parsed = JSON.parse(raw);
		return {
			available: parsed.available ?? [],
			joined: parsed.joined ?? [],
			progress: parsed.progress ?? {}
		};
	} catch {
		return { ...DEFAULT, available: [], joined: [], progress: {} };
	}
}

function save(state: ChallengeState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function generateId(): string {
	return `ch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createChallengeStore() {
	let state = $state<ChallengeState>(load());

	function createChallenge(
		title: string,
		description: string,
		targetWords: number,
		durationDays: number,
		creatorId = 'local'
	): Challenge {
		const now = new Date();
		const endsAt = new Date(now.getTime() + durationDays * 86_400_000);
		const challenge: Challenge = {
			id: generateId(),
			title: title.trim().slice(0, 80),
			description: description.trim().slice(0, 300),
			targetWords,
			durationDays,
			createdAt: now.toISOString(),
			endsAt: endsAt.toISOString(),
			creatorId
		};
		state.available = [...state.available, challenge];
		save(state);
		return challenge;
	}

	function join(challengeId: string): void {
		if (state.joined.includes(challengeId)) return;
		state.joined = [...state.joined, challengeId];
		state.progress = {
			...state.progress,
			[challengeId]: {
				challengeId,
				joinedAt: new Date().toISOString(),
				wordsContributed: 0
			}
		};
		save(state);
	}

	function leave(challengeId: string): void {
		state.joined = state.joined.filter((id) => id !== challengeId);
		const { [challengeId]: _removed, ...rest } = state.progress;
		state.progress = rest;
		save(state);
	}

	function addWords(challengeId: string, words: number): void {
		if (!state.joined.includes(challengeId)) return;
		const existing = state.progress[challengeId];
		if (!existing) return;
		state.progress = {
			...state.progress,
			[challengeId]: {
				...existing,
				wordsContributed: existing.wordsContributed + words
			}
		};
		save(state);
	}

	function isJoined(challengeId: string): boolean {
		return state.joined.includes(challengeId);
	}

	function getProgress(challengeId: string): ChallengeProgress | null {
		return state.progress[challengeId] ?? null;
	}

	function getActive(): Challenge[] {
		const now = Date.now();
		return state.available.filter((c) => new Date(c.endsAt).getTime() > now);
	}

	function reset(): void {
		state = { available: [], joined: [], progress: {} };
		save(state);
	}

	// Deadline reminders: notify once per day for joined challenges ending within 48h
	if (typeof localStorage !== 'undefined' && state.joined.length > 0) {
		const today = new Date().toISOString().slice(0, 10);
		let reminded: string[] = [];
		try {
			reminded = JSON.parse(localStorage.getItem(DEADLINE_REMINDER_KEY) ?? '[]');
		} catch { /* ignore */ }

		const reminderKey = `${today}`;
		const alreadyReminded = new Set<string>(
			reminded.filter((r) => r.startsWith(reminderKey)).map((r) => r.split(':')[1])
		);

		queueMicrotask(() => {
			const now = Date.now();
			const newReminded = [...reminded];
			for (const id of state.joined) {
				const challenge = state.available.find((c) => c.id === id);
				if (!challenge) continue;
				const msLeft = new Date(challenge.endsAt).getTime() - now;
				if (msLeft > 0 && msLeft <= 48 * 3_600_000 && !alreadyReminded.has(id)) {
					const hrsLeft = Math.ceil(msLeft / 3_600_000);
					notificationStore.notify(
						'challenge_deadline',
						`⏰ Challenge "${challenge.title}" ends in ${hrsLeft}h — keep writing!`,
						{ challengeId: id }
					);
					newReminded.push(`${reminderKey}:${id}`);
				}
			}
			localStorage.setItem(DEADLINE_REMINDER_KEY, JSON.stringify(newReminded.slice(-100)));
		});
	}

	return {
		get state() { return state; },
		createChallenge,
		join,
		leave,
		addWords,
		isJoined,
		getProgress,
		getActive,
		reset
	};
}

export const challengeStore = createChallengeStore();
