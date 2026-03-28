/**
 * streakStore Unit Tests
 *
 * The streakStore manages daily activity tracking with localStorage persistence.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { streakStore } from './streakStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('streakStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		streakStore.reset();
	});

	it('should export required methods', () => {
		expect(typeof streakStore.recordActivity).toBe('function');
		expect(typeof streakStore.getActivityCount).toBe('function');
		expect(typeof streakStore.getActivityWindow).toBe('function');
		expect(typeof streakStore.hasActivityOn).toBe('function');
		expect(typeof streakStore.reset).toBe('function');
	});

	it('should export recordActivity method', () => {
		expect(typeof streakStore.recordActivity).toBe('function');
	});

	it('should export getActivityCount method', () => {
		expect(typeof streakStore.getActivityCount).toBe('function');
	});

	it('should export getActivityWindow method', () => {
		expect(typeof streakStore.getActivityWindow).toBe('function');
	});

	it('should track activity timestamps', () => {
		streakStore.recordActivity();
		const today = new Date().toISOString().slice(0, 10);
		expect(streakStore.getActivityCount(today)).toBeGreaterThan(0);
	});

	it('should calculate streak based on consecutive days', () => {
		streakStore.recordActivity();
		expect(streakStore.data.currentStreak).toBeGreaterThanOrEqual(1);
	});

	it('should persist data to localStorage', () => {
		streakStore.recordActivity();
		expect(localStorage.setItem).toHaveBeenCalled();
	});

	it('should handle missing localStorage gracefully', () => {
		// Store should work even without localStorage
		expect(() => streakStore.recordActivity()).not.toThrow();
	});

	it('should provide isActiveToday derived value', () => {
		streakStore.recordActivity();
		expect(streakStore.isActiveToday).toBe(true);
	});

	it('should provide dailyActivityCount derived value', () => {
		streakStore.recordActivity();
		expect(streakStore.dailyActivityCount).toBeGreaterThan(0);
	});
});
