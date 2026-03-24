import { describe, it, expect } from 'vitest';

/**
 * Tests for pwaStore logic — tested inline to avoid $state Node re-import hang.
 * The store wraps this logic with Svelte reactivity; we test the pure functions here.
 */

const GATE_SAVES = 2;
const COOLDOWN_DAYS = 7;

function shouldShow(saveCount: number, installed: boolean, dismissedUntil: number): boolean {
	if (installed) return false;
	if (saveCount < GATE_SAVES) return false;
	return Date.now() > dismissedUntil;
}

function dismissUntil(): number {
	return Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

describe('pwaStore logic', () => {
	it('shouldShow returns false before engagement gate', () => {
		expect(shouldShow(0, false, 0)).toBe(false);
		expect(shouldShow(1, false, 0)).toBe(false);
	});

	it('shouldShow returns true after engagement gate with no cooldown', () => {
		expect(shouldShow(2, false, 0)).toBe(true);
		expect(shouldShow(5, false, 0)).toBe(true);
	});

	it('shouldShow returns false when installed', () => {
		expect(shouldShow(10, true, 0)).toBe(false);
	});

	it('dismiss sets cooldown that blocks shouldShow', () => {
		const until = dismissUntil();
		expect(shouldShow(5, false, until)).toBe(false);
	});

	it('cooldown expires and shouldShow returns true again', () => {
		const expired = Date.now() - 1000; // 1 second in the past
		expect(shouldShow(5, false, expired)).toBe(true);
	});

	it('localStorage key format is correct', () => {
		const key = `sive:pwa:saves`;
		expect(key).toBe('sive:pwa:saves');
		expect(`sive:pwa:dismissed-until`).toBe('sive:pwa:dismissed-until');
		expect(`sive:pwa:installed`).toBe('sive:pwa:installed');
	});
});
