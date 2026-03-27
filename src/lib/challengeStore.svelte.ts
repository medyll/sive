/**
 * challengeStore — Community writing challenges with API sync
 * 
 * S74-05: Updated to use /api/challenges endpoints with localStorage fallback
 */

import { browser } from '$app/environment';
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
	joined?: boolean;
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

// In-memory cache
let state: ChallengeState = { ...DEFAULT };

function load(): ChallengeState {
	if (!browser) return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...DEFAULT };
		const parsed = JSON.parse(raw);
		return {
			available: parsed.available ?? [],
			joined: parsed.joined ?? [],
			progress: parsed.progress ?? {}
		};
	} catch {
		return { ...DEFAULT };
	}
}

function save(newState: ChallengeState): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}

async function fetchChallenges(joinedOnly = false): Promise<Challenge[]> {
	if (!browser) return [];

	try {
		const url = joinedOnly ? '/api/challenges?joined=true' : '/api/challenges';
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		const data = await res.json();
		return data.challenges ?? [];
	} catch (err) {
		console.error('Failed to fetch challenges:', err);
		return load().available;
	}
}

async function createChallengeAPI(
	title: string,
	description: string,
	targetWords: number,
	durationDays: number
): Promise<Challenge | null> {
	if (!browser) return null;

	try {
		const res = await fetch('/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title, description, targetWords, durationDays })
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		const data = await res.json();
		return data.challenge;
	} catch (err) {
		console.error('Failed to create challenge:', err);
		return null;
	}
}

async function joinChallengeAPI(challengeId: string): Promise<boolean> {
	if (!browser) return false;

	try {
		const res = await fetch(`/api/challenges/${challengeId}/join`, { method: 'POST' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return true;
	} catch (err) {
		console.error('Failed to join challenge:', err);
		return false;
	}
}

async function leaveChallengeAPI(challengeId: string): Promise<boolean> {
	if (!browser) return false;

	try {
		const res = await fetch(`/api/challenges/${challengeId}/leave`, { method: 'POST' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return true;
	} catch (err) {
		console.error('Failed to leave challenge:', err);
		return false;
	}
}

async function updateProgressAPI(challengeId: string, words: number): Promise<number> {
	if (!browser) return 0;

	try {
		const res = await fetch(`/api/challenges/${challengeId}/progress`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ words })
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		const data = await res.json();
		return data.wordsContributed ?? 0;
	} catch (err) {
		console.error('Failed to update progress:', err);
		return 0;
	}
}

function createChallengeStore() {
	// Load initial state from localStorage
	state = load();

	/**
	 * Refresh challenges from API
	 */
	async function refresh(): Promise<void> {
		const challenges = await fetchChallenges();
		state = { ...state, available: challenges };
		save(state);
	}

	/**
	 * Create a new challenge (API + localStorage)
	 */
	function createChallenge(
		title: string,
		description: string,
		targetWords: number,
		durationDays: number,
		creatorId = 'local'
	): Challenge {
		const now = Date.now();
		const endsAt = new Date(now + durationDays * 86_400_000);
		
		const challenge: Challenge = {
			id: `ch_${now}_${Math.random().toString(36).slice(2, 7)}`,
			title: title.trim().slice(0, 80),
			description: description.trim().slice(0, 300),
			targetWords,
			durationDays,
			createdAt: new Date(now).toISOString(),
			endsAt: endsAt.toISOString(),
			creatorId
		};

		// Add to local state immediately (optimistic update)
		state = { ...state, available: [...state.available, challenge] };
		save(state);

		// Sync to API in background
		createChallengeAPI(title, description, targetWords, durationDays).catch(console.error);

		return challenge;
	}

	/**
	 * Join a challenge (API + localStorage)
	 */
	async function join(challengeId: string): Promise<void> {
		if (state.joined.includes(challengeId)) return;

		// Optimistic update
		state = {
			...state,
			joined: [...state.joined, challengeId],
			progress: {
				...state.progress,
				[challengeId]: {
					challengeId,
					joinedAt: new Date().toISOString(),
					wordsContributed: 0
				}
			}
		};
		save(state);

		// Sync to API in background
		joinChallengeAPI(challengeId).catch(console.error);
	}

	/**
	 * Leave a challenge (API + localStorage)
	 */
	async function leave(challengeId: string): Promise<void> {
		state = {
			...state,
			joined: state.joined.filter((id) => id !== challengeId)
		};
		const { [challengeId]: _removed, ...rest } = state.progress;
		state.progress = rest;
		save(state);

		// Sync to API in background
		leaveChallengeAPI(challengeId).catch(console.error);
	}

	/**
	 * Add words to challenge progress (API + localStorage)
	 */
	async function addWords(challengeId: string, words: number): Promise<void> {
		if (!state.joined.includes(challengeId)) return;
		
		const existing = state.progress[challengeId];
		if (!existing) return;

		// Optimistic update
		state = {
			...state,
			progress: {
				...state.progress,
				[challengeId]: {
					...existing,
					wordsContributed: existing.wordsContributed + words
				}
			}
		};
		save(state);

		// Sync to API in background
		updateProgressAPI(challengeId, words).catch(console.error);
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

	// Deadline reminders: notify once per day for joined challenges ending within 48h
	if (browser && state.joined.length > 0) {
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
		refresh,
		createChallenge,
		join,
		leave,
		addWords,
		isJoined,
		getProgress,
		getActive,
		reset: () => {
			state = { ...DEFAULT };
			save(state);
		}
	};
}

export const challengeStore = createChallengeStore();
