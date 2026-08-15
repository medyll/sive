import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { documents } from './db/schema';

/**
 * Documents are single-owner: a user either owns a document or has no access
 * to it at all. Sharing and collaborative roles were removed from the product,
 * so ownership is read directly from `documents.user_id`.
 */
export type DocumentRole = 'owner';

/**
 * Returns the user's role on a document, or null when they have no access.
 */
export async function getDocumentRole(
	db: unknown,
	userId: string,
	documentId: string
): Promise<DocumentRole | null> {
	if (!db) return null;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	const row = typedDb
		.select({ user_id: documents.user_id })
		.from(documents)
		.where(eq(documents.id, documentId))
		.get();

	if (!row) return null;

	return row.user_id === userId ? 'owner' : null;
}

/**
 * Verifies that the authenticated user owns the given document. Throws a
 * SvelteKit `error(403)` if they do not, or `error(401)` if no user is
 * authenticated.
 *
 * @returns The user's actual DocumentRole
 */
export async function requireDocumentRole(
	db: unknown,
	userId: string | undefined,
	documentId: string,
	_minimumRole: DocumentRole = 'owner'
): Promise<DocumentRole> {
	if (!userId) throw error(401, 'Unauthorized');

	const role = await getDocumentRole(db, userId, documentId);

	if (!role) throw error(403, 'Forbidden: you do not have access to this document');

	return role;
}
