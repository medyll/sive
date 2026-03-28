/**
 * keyboardStore — Virtual keyboard handling for mobile
 * 
 * S75-04: Virtual Keyboard Optimization
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'sive:keyboard';

export interface KeyboardState {
	isVisible: boolean;
	height: number;
	lastToggle: number;
}

const DEFAULT: KeyboardState = {
	isVisible: false,
	height: 0,
	lastToggle: 0
};

function createKeyboardStore() {
	let state = $state<KeyboardState>({ ...DEFAULT });

	/**
	 * Initialize keyboard listener (mobile only)
	 */
	function init(): void {
		if (!browser) return;

		// Visual viewport API for keyboard detection
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', handleViewportResize);
		}

		// Fallback: focus/blur events on textarea
		document.addEventListener('focusin', handleFocusIn);
		document.addEventListener('focusout', handleFocusOut);
	}

	function handleViewportResize(): void {
		if (!window.visualViewport) return;

		const viewportHeight = window.visualViewport.height;
		const windowHeight = window.innerHeight;
		
		// Keyboard is visible when viewport is smaller than window
		const wasVisible = state.isVisible;
		state.isVisible = viewportHeight < windowHeight - 100; // 100px threshold
		
		if (state.isVisible) {
			state.height = windowHeight - viewportHeight;
		} else {
			state.height = 0;
		}
		
		state.lastToggle = Date.now();

		// Save state
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		}

		// Dispatch custom event for components to listen
		if (wasVisible !== state.isVisible) {
			window.dispatchEvent(new CustomEvent('keyboard-change', { 
				detail: { isVisible: state.isVisible, height: state.height }
			}));
		}
	}

	function handleFocusIn(e: FocusEvent): void {
		if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
			state.isVisible = true;
			state.lastToggle = Date.now();
		}
	}

	function handleFocusOut(e: FocusEvent): void {
		if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
			// Delay to allow next focus to register
			setTimeout(() => {
				state.isVisible = false;
				state.height = 0;
				state.lastToggle = Date.now();
			}, 100);
		}
	}

	/**
	 * Scroll element into view above keyboard
	 */
	function scrollIntoView(element: HTMLElement, offset = 20): void {
		if (!state.isVisible) return;

		const elementRect = element.getBoundingClientRect();
		const keyboardTop = window.innerHeight - state.height - offset;

		if (elementRect.bottom > keyboardTop) {
			const scrollAmount = elementRect.bottom - keyboardTop;
			window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
		}
	}

	/**
	 * Get current keyboard height
	 */
	const keyboardHeight = $derived(state.height);

	/**
	 * Check if keyboard is visible
	 */
	const isKeyboardVisible = $derived(state.isVisible);

	function destroy(): void {
		if (window.visualViewport) {
			window.visualViewport.removeEventListener('resize', handleViewportResize);
		}
		document.removeEventListener('focusin', handleFocusIn);
		document.removeEventListener('focusout', handleFocusOut);
	}

	return {
		get state() { return state; },
		get keyboardHeight() { return keyboardHeight; },
		get isKeyboardVisible() { return isKeyboardVisible; },
		init,
		scrollIntoView,
		destroy
	};
}

export const keyboardStore = createKeyboardStore();
