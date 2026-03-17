import { describe, it, expect } from 'vitest';
import { getCursorColor, PALETTE } from './cursorColors';

describe('getCursorColor', () => {
	it('returns a color from the palette', () => {
		const color = getCursorColor('user-abc');
		expect(PALETTE).toContain(color);
	});

	it('is consistent for the same userId', () => {
		expect(getCursorColor('user-123')).toBe(getCursorColor('user-123'));
	});

	it('cycles through all 8 palette colors for different users', () => {
		const seen = new Set<string>();
		for (let i = 0; i < 100; i++) {
			seen.add(getCursorColor(`user-${i}`));
		}
		expect(seen.size).toBe(PALETTE.length);
	});

	it('different userIds can produce different colors', () => {
		const colors = new Set(['user-a', 'user-b', 'user-c', 'user-d'].map(getCursorColor));
		expect(colors.size).toBeGreaterThan(1);
	});

	it('works with empty string', () => {
		expect(PALETTE).toContain(getCursorColor(''));
	});
});

describe('cursor debounce logic', () => {
	it('respects 200ms debounce window', () => {
		const lastBroadcast = new Map<string, number>();
		const DEBOUNCE_MS = 200;

		function shouldBroadcast(userId: string, now: number): boolean {
			const last = lastBroadcast.get(userId) ?? 0;
			if (now - last < DEBOUNCE_MS) return false;
			lastBroadcast.set(userId, now);
			return true;
		}

		const t0 = 1000;
		expect(shouldBroadcast('u1', t0)).toBe(true);
		expect(shouldBroadcast('u1', t0 + 100)).toBe(false); // too soon
		expect(shouldBroadcast('u1', t0 + 200)).toBe(true);  // exactly 200ms
		expect(shouldBroadcast('u1', t0 + 250)).toBe(false); // too soon again
	});
});
