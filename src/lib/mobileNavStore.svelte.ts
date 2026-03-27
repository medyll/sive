/**
 * mobileNavStore — Mobile navigation drawer state
 * 
 * S75-01: Mobile Navigation Drawer
 */

const STORAGE_KEY = 'sive:mobileNav';

export interface MobileNavState {
	isOpen: boolean;
	hasBeenOpened: boolean;
}

const DEFAULT: MobileNavState = {
	isOpen: false,
	hasBeenOpened: false
};

function load(): MobileNavState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(state: MobileNavState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function createMobileNavStore() {
	let state = $state<MobileNavState>(load());

	function open(): void {
		state = { isOpen: true, hasBeenOpened: true };
		save(state);
	}

	function close(): void {
		state = { ...state, isOpen: false };
		save(state);
	}

	function toggle(): void {
		state = { isOpen: !state.isOpen, hasBeenOpened: true };
		save(state);
	}

	const isOpen = $derived(state.isOpen);

	return {
		get state() { return state; },
		get isOpen() { return isOpen; },
		get hasBeenOpened() { return state.hasBeenOpened; },
		open,
		close,
		toggle,
		reset: () => {
			state = { ...DEFAULT };
			save(state);
		}
	};
}

export const mobileNavStore = createMobileNavStore();
