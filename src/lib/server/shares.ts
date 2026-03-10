import { document_shares } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

export type DocumentRole = 'owner' | 'editor' | 'viewer';

/**
 * Returns the role of a user for a given document, or null if no share record exists.
 */
export async function getDocumentRole(
	db: unknown,
	userId: string,
	documentId: string
): Promise<DocumentRole | null> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const rows = typedDb
		.select({ role: document_shares.role })
		.from(document_shares)
		.where(and(eq(document_shares.user_id, userId), eq(document_shares.document_id, documentId)))
		.all();

	if (!rows || rows.length === 0) return null;
	return rows[0].role as DocumentRole;
}

/**
 * Creates an owner share record for a document.
 * Called automatically on document creation.
 */
export function createOwnerShare(db: unknown, documentId: string, userId: string): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	typedDb
		.insert(document_shares)
		.values({ document_id: documentId, user_id: userId, role: 'owner' })
		.run();
}

/**
 * Creates or updates a share record for a collaborator.
 */
export function upsertShare(
	db: unknown,
	documentId: string,
	userId: string,
	role: DocumentRole
): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	typedDb
		.insert(document_shares)
		.values({ document_id: documentId, user_id: userId, role })
		.onConflictDoUpdate({
			target: [document_shares.document_id, document_shares.user_id],
			set: { role }
		})
		.run();
}

/**
 * Removes a share record by its id.
 */
export function deleteShare(db: unknown, shareId: string): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	typedDb.delete(document_shares).where(eq(document_shares.id, shareId)).run();
}

/**
 * Lists all shares for a document with user info (document_id, user_id, role, id).
 */
export function listDocumentShares(
	db: unknown,
	documentId: string
): { id: string; user_id: string; role: DocumentRole }[] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	return typedDb
		.select({
			id: document_shares.id,
			user_id: document_shares.user_id,
			role: document_shares.role
		})
		.from(document_shares)
		.where(eq(document_shares.document_id, documentId))
		.all();
}
