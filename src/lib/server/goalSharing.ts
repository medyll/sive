/**
 * Goal sharing — read-only public links with 30-day expiry
 * Allows sharing goal summary (streak, word count, badges) without authentication
 */

export interface GoalShareLink {
	token: string;
	userId: string;
	createdAt: string;
	expiresAt: string; // 30 days from creation
	revoked: boolean;
}

export const store = new Map<string, GoalShareLink>(); // token → GoalShareLink
export const byUser = new Map<string, Set<string>>(); // userId → Set<token>

/**
 * Reset stores (for testing only)
 */
export function __resetStores() {
	store.clear();
	byUser.clear();
}

/**
 * Generate a shareable link for a user's goals (30-day default)
 */
export function createGoalShareLink(userId: string): GoalShareLink {
	const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12); // Short token
	const link: GoalShareLink = {
		token,
		userId,
		createdAt: new Date().toISOString(),
		expiresAt: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(), // 30 days
		revoked: false
	};
	store.set(token, link);
	if (!byUser.has(userId)) byUser.set(userId, new Set());
	byUser.get(userId)!.add(token);
	return link;
}

/**
 * Resolve a share link token — returns null if expired, revoked, or not found
 */
export function resolveGoalShareLink(token: string): GoalShareLink | null {
	const link = store.get(token);
	if (!link) return null;
	if (link.revoked) return null;
	if (new Date(link.expiresAt) < new Date()) return null;
	return link;
}

/**
 * Revoke a share link (owner-only)
 */
export function revokeGoalShareLink(token: string, userId: string): boolean {
	const link = store.get(token);
	if (!link || link.userId !== userId) return false;
	link.revoked = true;
	return true;
}

/**
 * Get all active share links for a user
 */
export function getUserGoalShareLinks(userId: string): GoalShareLink[] {
	const tokens = byUser.get(userId) ?? new Set();
	return [...tokens]
		.map((t) => store.get(t)!)
		.filter((l) => l && l.userId === userId && !l.revoked && new Date(l.expiresAt) >= new Date());
}
