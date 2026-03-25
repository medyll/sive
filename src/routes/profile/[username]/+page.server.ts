import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Profile page server loader
 *
 * Validates username and loads public profile data.
 * In MVP, uses localStorage to retrieve profiles (future: database lookup).
 */

export const load: PageServerLoad = async ({ params }) => {
	const { username } = params;

	if (!username || username.length === 0) {
		error(400, 'Username is required');
	}

	// MVP: Retrieve profile from localStorage using username
	// Future: Query database for user profile

	// For now, we'll return placeholder data that the client will validate
	// In production, this would fetch from a database or user service
	return {
		username,
		// Client-side component will validate profile visibility
		// Server cannot access localStorage, so validation happens client-side
	};
};
