import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, isMock } from '$lib/server/db';
import { document_shares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getDocumentRole, upsertShare, deleteShare, listDocumentShares } from '$lib/server/shares';
import type { DocumentRole } from '$lib/server/shares';

/** GET /api/shares?documentId=<id> — list collaborators for a document */
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const documentId = url.searchParams.get('documentId');
	if (!documentId) throw error(400, 'Missing documentId');

	if (isMock || !db) {
		return json({ shares: [] });
	}

	const role = await getDocumentRole(db, locals.user.id, documentId);
	if (!role) throw error(403, 'Forbidden');

	const shares = listDocumentShares(db, documentId);
	return json({ shares });
};

/** POST /api/shares — invite a collaborator
 *  Body: { documentId: string, targetEmail: string, role: "editor" | "viewer" }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const body = await request.json() as { documentId?: string; targetEmail?: string; role?: DocumentRole };
	const { documentId, targetEmail, role } = body;

	if (!documentId || !targetEmail || !role) throw error(400, 'Missing required fields');
	if (role === 'owner') throw error(400, 'Cannot assign owner role via invite');

	if (isMock || !db) {
		return json({ success: true, shareId: `stub-share-${Date.now()}` });
	}

	// Only owners can invite
	const callerRole = await getDocumentRole(db, locals.user.id, documentId);
	if (callerRole !== 'owner') throw error(403, 'Only the document owner can invite collaborators');

	// Look up target user by email
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const { users } = await import('$lib/server/db/schema');
	const targetUsers = typedDb.select({ id: users.id }).from(users).where(eq(users.email, targetEmail)).all();
	if (!targetUsers || targetUsers.length === 0) throw error(404, 'User not found');

	const targetUserId = targetUsers[0].id;
	upsertShare(db, documentId, targetUserId, role);

	// Fetch the newly created/updated share id
	const shares = listDocumentShares(db, documentId);
	const share = shares.find((s) => s.user_id === targetUserId);

	return json({ success: true, shareId: share?.id });
};

/** PATCH /api/shares/<shareId> — update a collaborator's role
 *  Body: { role: "editor" | "viewer" }
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const shareId = (params as Record<string, string>).shareId;
	const body = await request.json() as { role?: DocumentRole };
	const { role } = body;

	if (!role || role === 'owner') throw error(400, 'Invalid role');

	if (isMock || !db) return json({ success: true });

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const rows = typedDb.select().from(document_shares).where(eq(document_shares.id, shareId)).all();
	if (!rows || rows.length === 0) throw error(404, 'Share not found');

	const share = rows[0];
	const callerRole = await getDocumentRole(db, locals.user.id, share.document_id);
	if (callerRole !== 'owner') throw error(403, 'Only the document owner can update roles');

	upsertShare(db, share.document_id, share.user_id, role);
	return json({ success: true });
};

/** DELETE /api/shares/<shareId> — remove a collaborator */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const shareId = (params as Record<string, string>).shareId;

	if (isMock || !db) return json({ success: true });

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const rows = typedDb.select().from(document_shares).where(eq(document_shares.id, shareId)).all();
	if (!rows || rows.length === 0) throw error(404, 'Share not found');

	const share = rows[0];
	const callerRole = await getDocumentRole(db, locals.user.id, share.document_id);
	if (callerRole !== 'owner') throw error(403, 'Only the document owner can remove collaborators');

	deleteShare(db, shareId);
	return json({ success: true });
};
