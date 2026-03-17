/**
 * Document sharing — read-only public links with optional expiry
 */

export interface ShareLink {
	token: string;
	docId: string;
	userId: string;
	createdAt: string;
	expiresAt: string | null; // ISO or null = never
	revoked: boolean;
}

const store = new Map<string, ShareLink>(); // token → ShareLink
const byDoc = new Map<string, Set<string>>(); // docId → Set<token>

export function createShareLink(docId: string, userId: string, ttlHours?: number): ShareLink {
	const token = crypto.randomUUID().replace(/-/g, '');
	const link: ShareLink = {
		token,
		docId,
		userId,
		createdAt: new Date().toISOString(),
		expiresAt: ttlHours ? new Date(Date.now() + ttlHours * 3_600_000).toISOString() : null,
		revoked: false
	};
	store.set(token, link);
	if (!byDoc.has(docId)) byDoc.set(docId, new Set());
	byDoc.get(docId)!.add(token);
	return link;
}

export function resolveShareLink(token: string): ShareLink | null {
	const link = store.get(token);
	if (!link) return null;
	if (link.revoked) return null;
	if (link.expiresAt && new Date(link.expiresAt) < new Date()) return null;
	return link;
}

export function revokeShareLink(token: string, userId: string): boolean {
	const link = store.get(token);
	if (!link || link.userId !== userId) return false;
	link.revoked = true;
	return true;
}

export function getDocShareLinks(docId: string, userId: string): ShareLink[] {
	const tokens = byDoc.get(docId) ?? new Set();
	return [...tokens]
		.map((t) => store.get(t)!)
		.filter((l) => l && l.userId === userId && !l.revoked);
}
