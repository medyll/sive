/**
 * celebrationStore — Track milestone achievements and celebrations
 *
 * Manages celebration events (badge earned, streak reached) and provides
 * UI integration for notifications and animations.
 */

export interface Celebration {
	id: string;
	type: 'badge' | 'streak' | 'milestone';
	title: string;
	message: string;
	icon: string;
	timestamp: number;
	confetti?: boolean; // Show confetti animation
	sound?: boolean; // Play sound notification
}

export interface CelebrationState {
	current: Celebration | null;
	history: Celebration[];
}

const STORAGE_KEY = 'sive:celebrations';
const MAX_HISTORY = 50;

const DEFAULT: CelebrationState = {
	current: null,
	history: []
};

function load(): CelebrationState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(state: CelebrationState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function createCelebrationStore() {
	let state = $state<CelebrationState>(load());

	function celebrate(celebration: Omit<Celebration, 'id' | 'timestamp'>) {
		const newCelebration: Celebration = {
			...celebration,
			id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
			timestamp: Date.now()
		};

		// Set as current celebration
		state.current = newCelebration;

		// Add to history (keep max_history)
		state.history = [newCelebration, ...state.history].slice(0, MAX_HISTORY);
		save(state);

		// Auto-clear current after 4 seconds
		setTimeout(() => {
			if (state.current?.id === newCelebration.id) {
				state.current = null;
			}
		}, 4000);

		return newCelebration;
	}

	function clearCurrent() {
		state.current = null;
	}

	function getHistory(limit = 10): Celebration[] {
		return state.history.slice(0, limit);
	}

	function reset() {
		state = { ...DEFAULT };
		save(state);
	}

	return {
		get state() {
			return state;
		},
		celebrate,
		clearCurrent,
		getHistory,
		reset
	};
}

export const celebrationStore = createCelebrationStore();
