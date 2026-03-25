/**
 * Partners Store — tracks users you follow for accountability.
 *
 * Manages follow relationships and provides partner list for S66-03.
 * MVP implementation uses localStorage.
 */

const STORAGE_KEY = 'sive:partners';

export interface PartnersState {
	following: Set<string>;
}

const DEFAULT: PartnersState = {
	following: new Set()
};

function load(): PartnersState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT, following: new Set() };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		const data = saved ? JSON.parse(saved) : { following: [] };
		return {
			following: new Set(Array.isArray(data.following) ? data.following : [])
		};
	} catch {
		return { ...DEFAULT, following: new Set() };
	}
}

function save(state: PartnersState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			following: Array.from(state.following)
		}));
	}
}

function createPartnersStore() {
	let state = $state<PartnersState>(load());

	function follow(username: string): void {
		state.following.add(username);
		save(state);
	}

	function unfollow(username: string): void {
		state.following.delete(username);
		save(state);
	}

	function isFollowing(username: string): boolean {
		return state.following.has(username);
	}

	function getFollowing(): string[] {
		return Array.from(state.following);
	}

	function reset(): void {
		state = { following: new Set() };
		save(state);
	}

	const followingCount = $derived(state.following.size);

	return {
		get state() {
			return state;
		},
		get followingCount() {
			return followingCount;
		},
		follow,
		unfollow,
		isFollowing,
		getFollowing,
		reset
	};
}

export const partnersStore = createPartnersStore();
