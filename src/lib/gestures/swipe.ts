/**
 * swipe.ts — Swipe gesture detector for touch devices
 * 
 * S75-02: Touch Gestures for Editor
 */

export interface SwipeOptions {
	threshold?: number;      // Minimum swipe distance (px)
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	onSwipeUp?: () => void;
	onSwipeDown?: () => void;
}

export interface SwipeState {
	startX: number;
	startY: number;
	isSwiping: boolean;
	direction: 'left' | 'right' | 'up' | 'down' | null;
}

const DEFAULT_OPTIONS: SwipeOptions = {
	threshold: 50,  // 50px minimum swipe
};

/**
 * Create swipe gesture detector
 */
export function createSwipeDetector(
	element: HTMLElement,
	options: SwipeOptions = {}
): { destroy: () => void } {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	let state: SwipeState = {
		startX: 0,
		startY: 0,
		isSwiping: false,
		direction: null
	};

	function handleTouchStart(e: TouchEvent): void {
		const touch = e.touches[0];
		state = {
			startX: touch.clientX,
			startY: touch.clientY,
			isSwiping: true,
			direction: null
		};
	}

	function handleTouchMove(e: TouchEvent): void {
		if (!state.isSwiping) return;

		const touch = e.touches[0];
		const deltaX = touch.clientX - state.startX;
		const deltaY = touch.clientY - state.startY;

		// Determine dominant direction
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			// Horizontal swipe
			if (deltaX > 0) {
				state.direction = 'right';
			} else {
				state.direction = 'left';
			}
		} else {
			// Vertical swipe
			if (deltaY > 0) {
				state.direction = 'down';
			} else {
				state.direction = 'up';
			}
		}
	}

	function handleTouchEnd(e: TouchEvent): void {
		if (!state.isSwiping || !state.direction) {
			state = { startX: 0, startY: 0, isSwiping: false, direction: null };
			return;
		}

		const touch = e.changedTouches[0];
		const deltaX = touch.clientX - state.startX;
		const deltaY = touch.clientY - state.startY;

		// Check if swipe exceeded threshold
		const distance = state.direction === 'left' || state.direction === 'right'
			? Math.abs(deltaX)
			: Math.abs(deltaY);

		if (distance >= opts.threshold) {
			// Trigger callback
			switch (state.direction) {
				case 'left':
					opts.onSwipeLeft?.();
					break;
				case 'right':
					opts.onSwipeRight?.();
					break;
				case 'up':
					opts.onSwipeUp?.();
					break;
				case 'down':
					opts.onSwipeDown?.();
					break;
			}
		}

		state = { startX: 0, startY: 0, isSwiping: false, direction: null };
	}

	// Add event listeners
	element.addEventListener('touchstart', handleTouchStart, { passive: true });
	element.addEventListener('touchmove', handleTouchMove, { passive: true });
	element.addEventListener('touchend', handleTouchEnd, { passive: true });

	return {
		destroy: () => {
			element.removeEventListener('touchstart', handleTouchStart);
			element.removeEventListener('touchmove', handleTouchMove);
			element.removeEventListener('touchend', handleTouchEnd);
		}
	};
}

/**
 * Svelte action for swipe gestures
 * 
 * Usage: <div use:swipe={{ onSwipeLeft: () => {...} }}>
 */
export function swipe(element: HTMLElement, options: SwipeOptions): { destroy: () => void } {
	return createSwipeDetector(element, options);
}
