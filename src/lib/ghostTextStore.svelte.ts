/**
 * ghostTextStore — AI ghost text completions
 *
 * Shows inline AI completions as ghost text while typing.
 * Tab accepts, Escape dismisses.
 */

const STORAGE_KEY = 'sive:ghostText';

export interface GhostTextState {
	visible: boolean;
	text: string;
	cursorPosition: number;
	acceptedWords: string[];
	remainingText: string;
}

const DEFAULT: GhostTextState = {
	visible: false,
	text: '',
	cursorPosition: 0,
	acceptedWords: [],
	remainingText: ''
};

function load(): GhostTextState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(state: GhostTextState): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

function createGhostTextStore() {
	let state = $state<GhostTextState>(load());

	/**
	 * Show ghost text completion
	 */
	function show(text: string, cursorPosition: number): void {
		state = {
			visible: true,
			text,
			cursorPosition,
			acceptedWords: [],
			remainingText: text
		};
		save(state);
	}

	/**
	 * Hide ghost text
	 */
	function hide(): void {
		state = {
			...state,
			visible: false,
			text: '',
			acceptedWords: [],
			remainingText: ''
		};
		save(state);
	}

	/**
	 * Accept next word of ghost text (partial accept)
	 * Returns the accepted word, or full text if last word
	 */
	function acceptNextWord(): string | null {
		if (!state.visible || !state.remainingText) return null;

		const words = state.remainingText.split(' ');
		const nextWord = words[0];
		const remaining = words.slice(1).join(' ');

		state.acceptedWords = [...state.acceptedWords, nextWord];
		state.remainingText = remaining;

		if (!remaining) {
			// All accepted, hide ghost text
			hide();
		}

		return nextWord;
	}

	/**
	 * Accept all ghost text at once
	 */
	function acceptAll(): string | null {
		if (!state.visible || !state.text) return null;

		const text = state.text;
		hide();
		return text;
	}

	/**
	 * Check if ghost text is currently visible
	 */
	const isVisible = $derived(state.visible);

	/**
	 * Get the text to display as ghost (remaining portion)
	 */
	const displayText = $derived(state.remainingText || state.text);

	/**
	 * Get number of words already accepted
	 */
	const acceptedCount = $derived(state.acceptedWords.length);

	function reset(): void {
		state = { ...DEFAULT };
		save(state);
	}

	return {
		get state() { return state; },
		get isVisible() { return isVisible; },
		get displayText() { return displayText; },
		get acceptedCount() { return acceptedCount; },
		show,
		hide,
		acceptNextWord,
		acceptAll,
		reset
	};
}

export const ghostTextStore = createGhostTextStore();
