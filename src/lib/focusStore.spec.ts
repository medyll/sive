import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
	getItem: (k: string) => store[k] ?? null,
	setItem: (k: string, v: string) => { store[k] = v; },
	removeItem: (k: string) => { delete store[k]; }
});
vi.stubGlobal('window', { dispatchEvent: vi.fn() });

const { focusStore, AMBIENT_LABELS } = await import('./focusStore.svelte');

afterAll(() => vi.unstubAllGlobals());

describe('focusStore', () => {
	it('default pomodoroMinutes is 25', () => {
		expect(focusStore.state.pomodoroMinutes).toBe(25);
	});

	it('setDurations updates work and break', () => {
		focusStore.setDurations(45, 10);
		expect(focusStore.state.pomodoroMinutes).toBe(45);
		expect(focusStore.state.breakMinutes).toBe(10);
	});

	it('setAmbient changes ambient sound', () => {
		focusStore.setAmbient('rain');
		expect(focusStore.state.ambient).toBe('rain');
	});

	it('stopPomodoro resets active flag', () => {
		focusStore.stopPomodoro();
		expect(focusStore.state.pomodoroActive).toBe(false);
	});

	it('formattedTime is MM:SS', () => {
		focusStore.setDurations(25, 5);
		expect(focusStore.formattedTime).toMatch(/^\d{2}:\d{2}$/);
	});
});

describe('AMBIENT_LABELS', () => {
	it('has labels for all 5 sounds', () => {
		expect(Object.keys(AMBIENT_LABELS)).toHaveLength(5);
	});

	it('none label exists', () => {
		expect(AMBIENT_LABELS.none).toBe('No sound');
	});
});
