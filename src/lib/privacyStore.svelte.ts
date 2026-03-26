/**
 * privacyStore — user privacy preferences
 *
 * showOnLeaderboard: false by default (opt-in)
 * showInDiscovery: false by default (opt-in, separate from leaderboard)
 * displayName: used in both leaderboard and discovery listings
 */

const STORAGE_KEY = 'sive:privacy';

export interface PrivacyState {
	showOnLeaderboard: boolean;
	showInDiscovery: boolean;
	displayName: string;
}

const DEFAULT: PrivacyState = {
	showOnLeaderboard: false,
	showInDiscovery: false,
	displayName: ''
};

function load(): PrivacyState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(state: PrivacyState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function createPrivacyStore() {
	let state = $state<PrivacyState>(load());

	function setLeaderboardVisibility(visible: boolean): void {
		state.showOnLeaderboard = visible;
		save(state);
	}

	function setShowInDiscovery(visible: boolean): void {
		state.showInDiscovery = visible;
		save(state);
	}

	function setDisplayName(name: string): void {
		state.displayName = name.trim().slice(0, 30);
		save(state);
	}

	function reset(): void {
		state = { ...DEFAULT };
		save(state);
	}

	return {
		get state() { return state; },
		setLeaderboardVisibility,
		setShowInDiscovery,
		setDisplayName,
		reset
	};
}

export const privacyStore = createPrivacyStore();
