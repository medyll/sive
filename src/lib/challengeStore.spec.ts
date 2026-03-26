import { describe, it, expect, beforeEach, vi } from 'vitest';
import { challengeStore } from './challengeStore.svelte';

global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

beforeEach(() => {
	vi.clearAllMocks();
	challengeStore.reset();
});

describe('createChallenge', () => {
	it('adds a challenge to available', () => {
		challengeStore.createChallenge('NaNo Sprint', 'Write 50k words', 50000, 30);
		expect(challengeStore.state.available).toHaveLength(1);
	});

	it('trims title to 80 chars', () => {
		const c = challengeStore.createChallenge('A'.repeat(100), '', 1000, 7);
		expect(c.title).toHaveLength(80);
	});

	it('sets endsAt based on durationDays', () => {
		const before = Date.now();
		const c = challengeStore.createChallenge('Sprint', '', 1000, 7);
		const after = Date.now();
		const endsAt = new Date(c.endsAt).getTime();
		expect(endsAt).toBeGreaterThanOrEqual(before + 7 * 86_400_000);
		expect(endsAt).toBeLessThanOrEqual(after + 7 * 86_400_000);
	});
});

describe('join / leave', () => {
	it('joins a challenge', () => {
		const c = challengeStore.createChallenge('Test', '', 1000, 7);
		challengeStore.join(c.id);
		expect(challengeStore.isJoined(c.id)).toBe(true);
	});

	it('is idempotent — joining twice does not duplicate', () => {
		const c = challengeStore.createChallenge('Test', '', 1000, 7);
		challengeStore.join(c.id);
		challengeStore.join(c.id);
		expect(challengeStore.state.joined).toHaveLength(1);
	});

	it('initializes progress on join', () => {
		const c = challengeStore.createChallenge('Test', '', 1000, 7);
		challengeStore.join(c.id);
		expect(challengeStore.getProgress(c.id)?.wordsContributed).toBe(0);
	});

	it('leaves a challenge', () => {
		const c = challengeStore.createChallenge('Test', '', 1000, 7);
		challengeStore.join(c.id);
		challengeStore.leave(c.id);
		expect(challengeStore.isJoined(c.id)).toBe(false);
		expect(challengeStore.getProgress(c.id)).toBeNull();
	});
});

describe('addWords', () => {
	it('increments wordsContributed', () => {
		const c = challengeStore.createChallenge('Test', '', 1000, 7);
		challengeStore.join(c.id);
		challengeStore.addWords(c.id, 500);
		challengeStore.addWords(c.id, 250);
		expect(challengeStore.getProgress(c.id)?.wordsContributed).toBe(750);
	});

	it('is a no-op if not joined', () => {
		const c = challengeStore.createChallenge('Test', '', 1000, 7);
		challengeStore.addWords(c.id, 500);
		expect(challengeStore.getProgress(c.id)).toBeNull();
	});
});

describe('getActive', () => {
	it('returns only non-expired challenges', () => {
		challengeStore.createChallenge('Future', '', 1000, 7);
		const expired: any = {
			id: 'old',
			title: 'Old',
			description: '',
			targetWords: 1000,
			durationDays: 1,
			createdAt: new Date(0).toISOString(),
			endsAt: new Date(1).toISOString(),
			creatorId: 'local'
		};
		challengeStore.state.available = [...challengeStore.state.available, expired];
		expect(challengeStore.getActive()).toHaveLength(1);
		expect(challengeStore.getActive()[0].title).toBe('Future');
	});
});

describe('reset', () => {
	it('clears all state', () => {
		const c = challengeStore.createChallenge('Test', '', 1000, 7);
		challengeStore.join(c.id);
		challengeStore.reset();
		expect(challengeStore.state.available).toHaveLength(0);
		expect(challengeStore.state.joined).toHaveLength(0);
	});
});
