/**
 * User Profile Store — manages user profile data and privacy settings.
 *
 * Stores user info (name, bio), privacy settings (public/private),
 * and provides profile stats aggregated from other stores.
 */

const STORAGE_KEY = 'sive:user-profile';

export interface UserProfile {
	/** User's display name */
	name: string;
	/** Short bio (max 160 chars) */
	bio: string;
	/** Profile visibility: 'public' | 'private' */
	visibility: 'public' | 'private';
	/** When profile was created */
	createdAt: string;
	/** Optional username for URLs (@username) */
	username?: string;
}

const DEFAULT: UserProfile = {
	name: 'Writer',
	bio: '',
	visibility: 'private',
	createdAt: new Date().toISOString(),
	username: undefined
};

function load(): UserProfile {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		return saved ? { ...DEFAULT, ...JSON.parse(saved) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(profile: UserProfile): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
	}
}

/**
 * Generate a simple username from display name if not provided
 */
function generateUsername(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.substring(0, 20) || `user-${Date.now().toString(36)}`;
}

function createUserProfileStore() {
	let profile = $state<UserProfile>(load());

	/**
	 * Update profile information
	 */
	function updateProfile(updates: Partial<UserProfile>): void {
		profile = {
			...profile,
			...updates,
			// Ensure username is always set
			username: updates.username || profile.username || generateUsername(updates.name || profile.name)
		};
		save(profile);
	}

	/**
	 * Toggle profile visibility between public and private
	 */
	function toggleVisibility(): void {
		profile.visibility = profile.visibility === 'public' ? 'private' : 'public';
		save(profile);
	}

	/**
	 * Set profile to public
	 */
	function makePublic(): void {
		profile.visibility = 'public';
		save(profile);
	}

	/**
	 * Set profile to private
	 */
	function makePrivate(): void {
		profile.visibility = 'private';
		save(profile);
	}

	/**
	 * Reset profile to defaults
	 */
	function reset(): void {
		profile = { ...DEFAULT };
		save(profile);
	}

	/**
	 * Get profile for public display (check visibility first)
	 */
	function getPublicProfile(): UserProfile | null {
		return profile.visibility === 'public' ? { ...profile } : null;
	}

	/**
	 * Check if profile is publicly visible
	 */
	const isPublic = $derived(profile.visibility === 'public');

	/**
	 * Profile display name (safe for public display)
	 */
	const displayName = $derived(profile.name || 'Anonymous Writer');

	return {
		get profile() {
			return profile;
		},
		get isPublic() {
			return isPublic;
		},
		get displayName() {
			return displayName;
		},
		updateProfile,
		toggleVisibility,
		makePublic,
		makePrivate,
		getPublicProfile,
		reset
	};
}

export const userProfileStore = createUserProfileStore();
