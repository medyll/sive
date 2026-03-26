/**
 * discoveryQueries — in-memory store of writers who opted into discovery
 *
 * Writers submit their profile when visiting /discover with showInDiscovery=true.
 * Listed profiles are anonymous-safe: real name only shown if user opted in.
 */

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

// In-memory store: userId → profile
const store = new Map<string, DiscoveryProfile>();

export function submitDiscoveryProfile(profile: DiscoveryProfile): void {
	store.set(profile.userId, { ...profile, submittedAt: new Date().toISOString() });
}

export function listDiscoveryProfiles(): DiscoveryProfile[] {
	return [...store.values()].sort((a, b) => b.currentStreak - a.currentStreak);
}

export function removeDiscoveryProfile(userId: string): void {
	store.delete(userId);
}

export function __resetDiscovery(): void {
	store.clear();
}
