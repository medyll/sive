import { describe, it, expect, beforeEach, vi } from 'vitest';
import { partnersStore } from './partnersStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('partnersStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		partnersStore.reset();
	});

	it('should follow a partner', () => {
		partnersStore.follow('alice');

		expect(partnersStore.isFollowing('alice')).toBe(true);
		expect(partnersStore.getFollowing()).toContain('alice');
	});

	it('should unfollow a partner', () => {
		partnersStore.follow('alice');
		partnersStore.unfollow('alice');

		expect(partnersStore.isFollowing('alice')).toBe(false);
		expect(partnersStore.getFollowing()).not.toContain('alice');
	});

	it('should track multiple partners', () => {
		partnersStore.follow('alice');
		partnersStore.follow('bob');
		partnersStore.follow('charlie');

		expect(partnersStore.followingCount).toBe(3);
		expect(partnersStore.getFollowing()).toContain('alice');
		expect(partnersStore.getFollowing()).toContain('bob');
		expect(partnersStore.getFollowing()).toContain('charlie');
	});

	it('should not duplicate partners', () => {
		partnersStore.follow('alice');
		partnersStore.follow('alice');

		expect(partnersStore.followingCount).toBe(1);
		expect(partnersStore.getFollowing().filter((p) => p === 'alice')).toHaveLength(1);
	});

	it('should provide followingCount derived value', () => {
		expect(partnersStore.followingCount).toBe(0);

		partnersStore.follow('alice');
		expect(partnersStore.followingCount).toBe(1);

		partnersStore.follow('bob');
		expect(partnersStore.followingCount).toBe(2);

		partnersStore.unfollow('alice');
		expect(partnersStore.followingCount).toBe(1);
	});

	it('should persist to localStorage on follow', () => {
		partnersStore.follow('alice');
		expect(localStorage.setItem).toHaveBeenCalled();
	});

	it('should reset all partners', () => {
		partnersStore.follow('alice');
		partnersStore.follow('bob');

		expect(partnersStore.followingCount).toBe(2);

		partnersStore.reset();

		expect(partnersStore.followingCount).toBe(0);
		expect(partnersStore.getFollowing()).toHaveLength(0);
	});

	it('should handle empty following list', () => {
		expect(partnersStore.getFollowing()).toHaveLength(0);
		expect(partnersStore.followingCount).toBe(0);
		expect(partnersStore.isFollowing('alice')).toBe(false);
	});
});
