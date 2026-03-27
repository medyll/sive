/**
 * discoveryQueries — API-based writer discovery
 * 
 * S74-05: Updated to use /api/discover endpoint with localStorage fallback
 */

import { browser } from '$app/environment';

export interface DiscoveryProfile {
	userId: string;
	displayName: string;
	currentStreak: number;
	longestStreak: number;
	totalWords: number;
	topBadgeIcon: string;
	topBadgeName: string;
	submittedAt: string;
}

// In-memory cache
let cache: DiscoveryProfile[] = [];
let lastFetch = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Fetch discovery profiles from API
 */
export async function fetchDiscoveryProfiles(): Promise<DiscoveryProfile[]> {
	if (!browser) return [];

	// Return cached data if fresh
	if (cache.length > 0 && Date.now() - lastFetch < CACHE_DURATION) {
		return cache;
	}

	try {
		const res = await fetch('/api/discover');
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		const data = await res.json();
		cache = data.profiles ?? [];
		lastFetch = Date.now();
		return cache;
	} catch (err) {
		console.error('Failed to fetch discovery profiles:', err);
		return cache; // Return cached data on error
	}
}

/**
 * Submit profile to discovery
 */
export async function submitDiscoveryProfile(profile: Omit<DiscoveryProfile, 'submittedAt'>): Promise<boolean> {
	if (!browser) return false;

	try {
		const res = await fetch('/api/discover', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(profile)
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		// Invalidate cache
		cache = [];
		return true;
	} catch (err) {
		console.error('Failed to submit discovery profile:', err);
		return false;
	}
}

/**
 * Opt out of discovery
 */
export async function removeDiscoveryProfile(): Promise<boolean> {
	if (!browser) return false;

	try {
		const res = await fetch('/api/discover', { method: 'DELETE' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		
		// Invalidate cache
		cache = [];
		return true;
	} catch (err) {
		console.error('Failed to remove discovery profile:', err);
		return false;
	}
}

/**
 * Clear cache (for testing)
 */
export function __resetDiscovery(): void {
	cache = [];
	lastFetch = 0;
}
