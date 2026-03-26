import { describe, it, expect, beforeEach, vi } from 'vitest';
import { privacyStore } from './privacyStore.svelte';

global.localStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('privacyStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		privacyStore.reset();
	});

	it('should default to hidden (showOnLeaderboard=false)', () => {
		expect(privacyStore.state.showOnLeaderboard).toBe(false);
	});

	it('should enable leaderboard visibility', () => {
		privacyStore.setLeaderboardVisibility(true);
		expect(privacyStore.state.showOnLeaderboard).toBe(true);
	});

	it('should disable leaderboard visibility', () => {
		privacyStore.setLeaderboardVisibility(true);
		privacyStore.setLeaderboardVisibility(false);
		expect(privacyStore.state.showOnLeaderboard).toBe(false);
	});

	it('should set display name', () => {
		privacyStore.setDisplayName('Alice');
		expect(privacyStore.state.displayName).toBe('Alice');
	});

	it('should trim display name whitespace', () => {
		privacyStore.setDisplayName('  Bob  ');
		expect(privacyStore.state.displayName).toBe('Bob');
	});

	it('should cap display name at 30 chars', () => {
		privacyStore.setDisplayName('A'.repeat(50));
		expect(privacyStore.state.displayName).toHaveLength(30);
	});

	it('should persist to localStorage', () => {
		privacyStore.setLeaderboardVisibility(true);
		expect(localStorage.setItem).toHaveBeenCalled();
	});

	it('should default to hidden (showInDiscovery=false)', () => {
		expect(privacyStore.state.showInDiscovery).toBe(false);
	});

	it('should enable discovery visibility', () => {
		privacyStore.setShowInDiscovery(true);
		expect(privacyStore.state.showInDiscovery).toBe(true);
	});

	it('should disable discovery visibility', () => {
		privacyStore.setShowInDiscovery(true);
		privacyStore.setShowInDiscovery(false);
		expect(privacyStore.state.showInDiscovery).toBe(false);
	});

	it('should reset to defaults', () => {
		privacyStore.setLeaderboardVisibility(true);
		privacyStore.setShowInDiscovery(true);
		privacyStore.setDisplayName('Alice');
		privacyStore.reset();
		expect(privacyStore.state.showOnLeaderboard).toBe(false);
		expect(privacyStore.state.showInDiscovery).toBe(false);
		expect(privacyStore.state.displayName).toBe('');
	});
});
