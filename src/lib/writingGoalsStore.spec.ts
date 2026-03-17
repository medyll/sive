import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
	getItem: (k: string) => store[k] ?? null,
	setItem: (k: string, v: string) => { store[k] = v; },
	removeItem: (k: string) => { delete store[k]; }
});

// Re-import after stub
const { goalsStore } = await import('./writingGoalsStore.svelte');

beforeEach(() => {
	goalsStore.reset();
});

describe('setDailyTarget', () => {
	it('sets a new daily target', () => {
		goalsStore.setDailyTarget(1000);
		expect(goalsStore.goals.dailyTarget).toBe(1000);
	});

	it('clamps to min 1', () => {
		goalsStore.setDailyTarget(0);
		expect(goalsStore.goals.dailyTarget).toBe(1);
	});

	it('clamps to max 100000', () => {
		goalsStore.setDailyTarget(999999);
		expect(goalsStore.goals.dailyTarget).toBe(100_000);
	});
});

describe('recordWords', () => {
	it('updates todayWords', () => {
		goalsStore.recordWords(200);
		expect(goalsStore.goals.todayWords).toBe(200);
	});

	it('takes max when called multiple times same day', () => {
		goalsStore.recordWords(100);
		goalsStore.recordWords(300);
		goalsStore.recordWords(200);
		expect(goalsStore.goals.todayWords).toBe(300);
	});

	it('initialises streak to 1 on first write', () => {
		goalsStore.recordWords(50);
		expect(goalsStore.goals.streak).toBe(1);
	});
});

describe('progress & goalMet', () => {
	it('progress is 0 when no words written', () => {
		expect(goalsStore.progress).toBe(0);
	});

	it('progress is 1 when goal is met', () => {
		goalsStore.setDailyTarget(100);
		goalsStore.recordWords(100);
		expect(goalsStore.progress).toBe(1);
		expect(goalsStore.goalMet).toBe(true);
	});

	it('remaining is correct', () => {
		goalsStore.setDailyTarget(500);
		goalsStore.recordWords(200);
		expect(goalsStore.remaining).toBe(300);
	});
});
