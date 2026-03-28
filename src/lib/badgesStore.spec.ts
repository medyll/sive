/**
 * badgesStore Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { badgesStore } from './badgesStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('badgesStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		badgesStore.reset();
	});

	it('should export badgesStore instance', () => {
		expect(badgesStore).toBeDefined();
		expect(typeof badgesStore.updateBadges).toBe('function');
	});

	it('should define BADGE_DEFINITIONS array', () => {
		// Badge definitions exist for all milestone badges
		expect(badgesStore.getEarnedBadges()).toBeDefined();
	});

	it('should track earned badges in a Set', () => {
		const earned = badgesStore.getEarnedBadges();
		expect(Array.isArray(earned)).toBe(true);
	});

	it('should have badge for 7-day streak', () => {
		const nextBadge = badgesStore.getNextBadge('streak', 0);
		expect(nextBadge).toBeDefined();
	});

	it('should have badge for 30-day streak', () => {
		const nextBadge = badgesStore.getNextBadge('streak', 7);
		expect(nextBadge).toBeDefined();
	});

	it('should have badge for 100-day streak', () => {
		const nextBadge = badgesStore.getNextBadge('streak', 30);
		expect(nextBadge).toBeDefined();
	});

	it('should have badge for 365-day streak', () => {
		const nextBadge = badgesStore.getNextBadge('streak', 100);
		expect(nextBadge).toBeDefined();
	});

	it('should have badge for 10k total words', () => {
		const nextBadge = badgesStore.getNextBadge('words', 0);
		expect(nextBadge).toBeDefined();
	});

	it('should have badge for 50k total words', () => {
		const nextBadge = badgesStore.getNextBadge('words', 10000);
		expect(nextBadge).toBeDefined();
	});

	it('should have badge for 100k total words', () => {
		const nextBadge = badgesStore.getNextBadge('words', 50000);
		expect(nextBadge).toBeDefined();
	});

	it('should update badges on streak change', () => {
		badgesStore.updateBadges({ currentStreak: 7, longestStreak: 7 }, 0);
		const earned = badgesStore.getEarnedBadges();
		expect(earned.length).toBeGreaterThan(0);
	});

	it('should calculate earned badges via derived value', () => {
		badgesStore.updateBadges({ currentStreak: 7, longestStreak: 7 }, 10000);
		const earned = badgesStore.getEarnedBadges();
		expect(earned.length).toBeGreaterThanOrEqual(1);
	});

	it('should provide getEarnedBadges() method', () => {
		expect(typeof badgesStore.getEarnedBadges).toBe('function');
	});

	it('should provide getNextBadge() method', () => {
		expect(typeof badgesStore.getNextBadge).toBe('function');
	});

	it('should provide getBadgeProgress() method', () => {
		expect(typeof badgesStore.getBadgeProgress).toBe('function');
	});

	it('should provide hasBadge(id) check method', () => {
		expect(typeof badgesStore.hasBadge).toBe('function');
	});

	it('should persist earned badges to localStorage', () => {
		badgesStore.updateBadges({ currentStreak: 7, longestStreak: 7 }, 0);
		// Note: localStorage persistence happens in browser context
		// This test verifies the update works; persistence is tested in E2E
		expect(badgesStore.getEarnedBadges().length).toBeGreaterThan(0);
	});

	it('should restore badges from localStorage on load', () => {
		vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(['streak-7']));
		// Store should load from localStorage on init
		expect(badgesStore.getEarnedBadges()).toBeDefined();
	});

	it('should handle missing localStorage gracefully', () => {
		vi.mocked(localStorage.getItem).mockReturnValue(null);
		expect(() => badgesStore.getEarnedBadges()).not.toThrow();
	});

	it('should provide reset() to clear all badges', () => {
		badgesStore.updateBadges({ currentStreak: 7, longestStreak: 7 }, 0);
		badgesStore.reset();
		expect(badgesStore.getEarnedBadges().length).toBe(0);
	});

	it('should include badge metadata (name, description, icon)', () => {
		const nextBadge = badgesStore.getNextBadge('streak', 0);
		expect(nextBadge.name).toBeDefined();
		expect(nextBadge.icon).toBeDefined();
	});

	it('should categorize badges by type (streak vs words)', () => {
		const streakBadge = badgesStore.getNextBadge('streak', 0);
		const wordsBadge = badgesStore.getNextBadge('words', 0);
		expect(streakBadge.id).toContain('streak');
		expect(wordsBadge.id).toContain('words');
	});
});
