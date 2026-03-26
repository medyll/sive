import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shareLinksStore } from './shareLinksStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('shareLinksStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset store
		shareLinksStore.clear();
	});

	it('should add a new share link', () => {
		const link = {
			token: 'abc123def456',
			url: '/goals/abc123def456',
			expiresAt: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString()
		};

		shareLinksStore.addLink(link);
		const active = shareLinksStore.getActiveLinks();
		expect(active).toHaveLength(1);
		expect(active[0].token).toBe(link.token);
	});

	it('should remove a share link', () => {
		const link = {
			token: 'abc123def456',
			url: '/goals/abc123def456',
			expiresAt: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString()
		};

		shareLinksStore.addLink(link);
		shareLinksStore.removeLink(link.token);

		const active = shareLinksStore.getActiveLinks();
		expect(active).toHaveLength(0);
	});

	it('should filter out expired links', () => {
		const activeLink = {
			token: 'active',
			url: '/goals/active',
			expiresAt: new Date(Date.now() + 1000).toISOString() // 1 second
		};

		const expiredLink = {
			token: 'expired',
			url: '/goals/expired',
			expiresAt: new Date(Date.now() - 1000).toISOString() // 1 second ago
		};

		shareLinksStore.addLink(activeLink);
		shareLinksStore.addLink(expiredLink);

		const active = shareLinksStore.getActiveLinks();
		expect(active).toHaveLength(1);
		expect(active[0].token).toBe('active');
	});

	it('should clear all links', () => {
		const link = {
			token: 'abc123',
			url: '/goals/abc123',
			expiresAt: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString()
		};

		shareLinksStore.addLink(link);
		shareLinksStore.clear();

		const active = shareLinksStore.getActiveLinks();
		expect(active).toHaveLength(0);
	});

	it('should persist to localStorage on add', () => {
		const link = {
			token: 'abc123',
			url: '/goals/abc123',
			expiresAt: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString()
		};

		shareLinksStore.addLink(link);
		expect(localStorage.setItem).toHaveBeenCalled();
	});
});
