/**
 * activityStore — Activity feed with API sync
 * 
 * S74-05: Updated to use /api/activity endpoint with localStorage fallback
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'sive:activity';
const MAX_EVENTS = 100;

export type ActivityType =
	| 'badge_earned'
	| 'streak_milestone'
	| 'leaderboard_entry'
	| 'goal_completed'
	| 'challenge_progress';

export interface ActivityEvent {
	id: string;
	type: ActivityType;
	userId: string;
	displayName: string;
	timestamp: number;
	payload: Record<string, unknown>;
}

export interface ActivityState {
	events: ActivityEvent[];
}

const DEFAULT: ActivityState = { events: [] };

// In-memory cache
let state: ActivityState = { events: [] };

function load(): ActivityState {
	if (!browser) return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(newState: ActivityState): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}

async function fetchActivityFeed(limit = 50): Promise<ActivityEvent[]> {
	if (!browser) return [];

	try {
		const res = await fetch(`/api/activity?limit=${limit}`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		const data = await res.json();
		return data.events ?? [];
	} catch (err) {
		console.error('Failed to fetch activity feed:', err);
		return load().events;
	}
}

async function emitActivityEvent(
	type: ActivityType,
	displayName: string,
	payload: Record<string, unknown> = {}
): Promise<ActivityEvent | null> {
	if (!browser) return null;

	try {
		const res = await fetch('/api/activity', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type, displayName, payload })
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		const data = await res.json();
		return data.event;
	} catch (err) {
		console.error('Failed to emit activity event:', err);
		return null;
	}
}

function createActivityStore() {
	// Load initial state from localStorage
	state = load();

	/**
	 * Emit a new activity event (syncs to API and localStorage)
	 */
	async function emit(
		type: ActivityType,
		userId: string,
		displayName: string,
		payload: Record<string, unknown> = {}
	): Promise<ActivityEvent> {
		const event: ActivityEvent = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			type,
			userId,
			displayName,
			timestamp: Date.now(),
			payload
		};

		// Add to local state immediately (optimistic update)
		const events = [event, ...state.events].slice(0, MAX_EVENTS);
		state = { events };
		save(state);

		// Sync to API in background
		emitActivityEvent(type, displayName, payload).catch(console.error);

		return event;
	}

	/**
	 * Refresh events from API
	 */
	async function refresh(limit = 50): Promise<void> {
		const events = await fetchActivityFeed(limit);
		state = { events };
		save(state);
	}

	/** All events for a specific user, newest first */
	function getByUser(userId: string): ActivityEvent[] {
		return state.events.filter((e) => e.userId === userId);
	}

	/** Events of a given type, newest first */
	function getByType(type: ActivityType): ActivityEvent[] {
		return state.events.filter((e) => e.type === type);
	}

	/** Events since a given timestamp */
	function getSince(since: number): ActivityEvent[] {
		return state.events.filter((e) => e.timestamp >= since);
	}

	/** Total event count */
	const count = $derived(state.events.length);

	function reset(): void {
		state = { ...DEFAULT };
		save(state);
	}

	return {
		get state() { return state; },
		get count() { return count; },
		emit,
		refresh,
		getByUser,
		getByType,
		getSince,
		reset
	};
}

export const activityStore = createActivityStore();
