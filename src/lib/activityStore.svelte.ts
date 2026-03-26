/**
 * activityStore — ring-buffer event store for social activity
 *
 * Records activity events (badge_earned, streak_milestone, leaderboard_entry,
 * goal_completed) per user. Capped at MAX_EVENTS (100) — oldest removed first.
 * Used as the data source for the partner activity feed.
 */

const STORAGE_KEY = 'sive:activity';
const MAX_EVENTS = 100;

export type ActivityType =
	| 'badge_earned'
	| 'streak_milestone'
	| 'leaderboard_entry'
	| 'goal_completed';

export interface ActivityEvent {
	id: string;
	type: ActivityType;
	userId: string;       // Who performed the activity
	displayName: string;  // @username or @anonXXXX
	timestamp: number;
	payload: Record<string, unknown>; // Type-specific data
}

export interface ActivityState {
	events: ActivityEvent[];
}

const DEFAULT: ActivityState = { events: [] };

function load(): ActivityState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(state: ActivityState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function makeId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createActivityStore() {
	let state = $state<ActivityState>(load());

	/**
	 * Emit a new activity event. Fire-and-forget — non-blocking.
	 * Oldest events are dropped when MAX_EVENTS is reached.
	 */
	function emit(
		type: ActivityType,
		userId: string,
		displayName: string,
		payload: Record<string, unknown> = {}
	): ActivityEvent {
		const event: ActivityEvent = {
			id: makeId(),
			type,
			userId,
			displayName,
			timestamp: Date.now(),
			payload
		};

		// Ring buffer: prepend new, trim tail
		const events = [event, ...state.events].slice(0, MAX_EVENTS);
		state.events = events;
		save(state);
		return event;
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
		getByUser,
		getByType,
		getSince,
		reset
	};
}

export const activityStore = createActivityStore();
