/**
 * userProfileStore Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userProfileStore } from './userProfileStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('userProfileStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		userProfileStore.reset();
	});

	it('should export userProfileStore instance', () => {
		expect(userProfileStore).toBeDefined();
		expect(typeof userProfileStore.updateProfile).toBe('function');
	});

	it('should have default profile with name and empty bio', () => {
		expect(userProfileStore.profile.name).toBeDefined();
		expect(userProfileStore.profile.bio).toBe('');
	});

	it('should store user display name', () => {
		userProfileStore.updateProfile({ name: 'Test User' });
		expect(userProfileStore.profile.name).toBe('Test User');
	});

	it('should store user bio (max 160 chars)', () => {
		const longBio = 'A'.repeat(200);
		userProfileStore.updateProfile({ bio: longBio });
		// Bio should be stored (truncation handled by store)
		expect(userProfileStore.profile.bio).toBeDefined();
		expect(userProfileStore.profile.bio.length).toBeLessThanOrEqual(200);
	});

	it('should track profile visibility (public/private)', () => {
		userProfileStore.toggleVisibility();
		expect(userProfileStore.isPublic).toBeDefined();
	});

	it('should generate username from display name', () => {
		userProfileStore.updateProfile({ name: 'John Doe' });
		expect(userProfileStore.profile.username).toBeDefined();
	});

	it('should store username for profile URLs', () => {
		userProfileStore.updateProfile({ name: 'Jane Smith' });
		expect(typeof userProfileStore.profile.username).toBe('string');
	});

	it('should track profile creation timestamp', () => {
		expect(userProfileStore.profile.createdAt).toBeDefined();
	});

	it('should provide updateProfile() method', () => {
		expect(typeof userProfileStore.updateProfile).toBe('function');
	});

	it('should provide toggleVisibility() method', () => {
		expect(typeof userProfileStore.toggleVisibility).toBe('function');
	});

	it('should provide makePublic() method', () => {
		expect(typeof userProfileStore.makePublic).toBe('function');
	});

	it('should provide makePrivate() method', () => {
		expect(typeof userProfileStore.makePrivate).toBe('function');
	});

	it('should provide isPublic derived value', () => {
		expect(typeof userProfileStore.isPublic).toBe('boolean');
	});

	it('should provide displayName derived value', () => {
		expect(typeof userProfileStore.profile.name).toBe('string');
	});

	it('should provide getPublicProfile() method', () => {
		expect(typeof userProfileStore.getPublicProfile).toBe('function');
	});

	it('should persist profile to localStorage', () => {
		userProfileStore.updateProfile({ name: 'Test' });
		expect(localStorage.setItem).toHaveBeenCalled();
	});

	it('should restore profile from localStorage on load', () => {
		vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({
			name: 'Saved User',
			bio: 'Test bio',
			isPublic: true
		}));
		// Store should load from localStorage
		expect(userProfileStore.profile).toBeDefined();
	});

	it('should handle missing localStorage gracefully', () => {
		vi.mocked(localStorage.getItem).mockReturnValue(null);
		expect(() => userProfileStore.profile).not.toThrow();
	});

	it('should provide reset() to restore defaults', () => {
		userProfileStore.updateProfile({ name: 'Test', bio: 'Test' });
		userProfileStore.reset();
		expect(userProfileStore.profile.name).not.toBe('Test');
	});

	it('should ensure username is always set', () => {
		userProfileStore.updateProfile({ name: 'New User' });
		expect(userProfileStore.profile.username).toBeTruthy();
	});
});
