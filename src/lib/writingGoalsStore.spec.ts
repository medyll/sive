import { describe, it, expect, beforeEach, vi } from 'vitest';
import { goalsStore } from './writingGoalsStore.svelte';

// Stub localStorage
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
	getItem: (k: string) => store[k] ?? null,
	setItem: (k: string, v: string) => { store[k] = v; },
	removeItem: (k: string) => { delete store[k]; },
	clear: () => { for (const k in store) delete store[k]; }
});

beforeEach(() => {
	localStorage.clear();
	goalsStore.reset();
});

describe('setDailyTarget', () => {
	it('updates the daily target', () => {
		goalsStore.setDailyTarget(1000);
		expect(goalsStore.goals.dailyTarget).toBe(1000);
	});

	it('clamps minimum to 1', () => {
		goalsStore.setDailyTarget(0);
		expect(goalsStore.goals.dailyTarget).toBe(1);
	});

	it('clamps maximum to 100 000', () => {
		goalsStore.setDailyTarget(999999);
		expect(goalsStore.goals.dailyTarget).toBe(100_000);
	});
});

describe('recordWords', () => {
	it('sets todayWords when recording for the first time', () => {
		goalsStore.recordWords(200);
		expect(goalsStore.goals.todayWords).toBe(200);
	});

	it('keeps the max when called again the same day', () => {
		goalsStore.recordWords(200);
		goalsStore.recordWords(150);
		expect(goalsStore.goals.todayWords).toBe(200);
		goalsStore.recordWords(300);
		expect(goalsStore.goals.todayWords).toBe(300);
	});
});

describe('progress / goalMet / remaining', () => {
	it('progress is 0 when no words recorded', () => {
		goalsStore.setDailyTarget(500);
		expect(goalsStore.progress).toBe(0);
	});

	it('progress reaches 1 when goal is met', () => {
		goalsStore.setDailyTarget(100);
		goalsStore.recordWords(100);
		expect(goalsStore.progress).toBe(1);
		expect(goalsStore.goalMet).toBe(true);
		expect(goalsStore.remaining).toBe(0);
	});

	it('remaining decreases as words are added', () => {
		goalsStore.setDailyTarget(500);
		goalsStore.recordWords(200);
		expect(goalsStore.remaining).toBe(300);
	});
});

describe('reset', () => {
	it('resets all fields to defaults', () => {
		goalsStore.setDailyTarget(999);
		goalsStore.recordWords(400);
		goalsStore.reset();
		expect(goalsStore.goals.dailyTarget).toBe(500);
		expect(goalsStore.goals.todayWords).toBe(0);
	});
});
