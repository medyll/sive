import { db, isMock } from '$lib/server/db';
import { documents, document_shares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { createOwnerShare } from '$lib/server/shares';
import { requireDocumentRole } from '$lib/server/rbac';
import type { PageServerLoad, Actions } from './$types';

// Guest user id used when auth is unavailable (mock/dev mode)
const GUEST_USER_ID = 'guest';

// Stub documents for mock/dev mode
const STUB_DOCUMENTS = [
	{
		id: 'stub-doc-1',
		user_id: GUEST_USER_ID,
		title: 'Chapter 1',
		content: 'Once upon a time, in a land far away…',
		created_at: Date.now(),
		updated_at: Date.now()
	}
];

export const load: PageServerLoad = async ({ locals }) => {
	// In production mode (real DB + auth), require authentication
	if (!isMock && !locals.user) {
		throw redirect(302, '/auth');
	}

	const userId = locals.user?.id ?? GUEST_USER_ID;

	if (isMock || !db) {
		return { documents: STUB_DOCUMENTS, activeDocumentId: STUB_DOCUMENTS[0].id, user: locals.user ?? null };
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	// Fetch all share records for this user to find accessible documents
	const userShares: { document_id: string; role: string }[] = typedDb
		.select({ document_id: document_shares.document_id, role: document_shares.role })
		.from(document_shares)
		.where(eq(document_shares.user_id, userId))
		.all() ?? [];

	if (userShares.length === 0) {
		// First visit — create a default document and owner share
		const newDoc = {
			id: crypto.randomUUID(),
			user_id: userId,
			title: 'Untitled',
			content: '',
			created_at: Date.now(),
			updated_at: Date.now()
		};
		typedDb.insert(documents).values(newDoc).run();
		createOwnerShare(db, newDoc.id, userId);
		return { documents: [{ ...newDoc, role: 'owner' }], activeDocumentId: newDoc.id };
	}

	// Fetch all accessible documents in one pass, annotate with role
	const shareMap = new Map(userShares.map((s) => [s.document_id, s.role]));
	const accessibleDocIds = userShares.map((s) => s.document_id);

	// Fetch each document (SQLite doesn't support IN with drizzle easily — fetch individually)
	const docs = accessibleDocIds
		.map((docId) => {
			const rows = typedDb.select().from(documents).where(eq(documents.id, docId)).all();
			if (!rows || rows.length === 0) return null;
			return { ...rows[0], role: shareMap.get(docId) ?? 'viewer' };
		})
		.filter(Boolean)
		.sort((a: { updated_at: number }, b: { updated_at: number }) => b.updated_at - a.updated_at);

	return { documents: docs, activeDocumentId: docs[0]?.id ?? null, user: locals.user ?? null, preferences: locals.preferences ?? null };
};

export const actions: Actions = {
	createDocument: async ({ locals }) => {
		const userId = locals.user?.id ?? GUEST_USER_ID;

		if (isMock || !db) {
			return { success: true, id: `stub-doc-${Date.now()}` };
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		const newDoc = {
			id: crypto.randomUUID(),
			user_id: userId,
			title: 'Untitled',
			content: '',
			created_at: Date.now(),
			updated_at: Date.now()
		};
		typedDb.insert(documents).values(newDoc).run();
		createOwnerShare(db, newDoc.id, userId);
		return { success: true, id: newDoc.id };
	},

	updateDocument: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const content = data.get('content') as string | null;
		const title = data.get('title') as string | null;

		if (!id) return { success: false, error: 'Missing document id' };

		if (isMock || !db) {
			return { success: true };
		}

		// Require at least editor role
		await requireDocumentRole(db, locals.user?.id, id, 'editor');

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updates: Record<string, any> = { updated_at: Date.now() };
		if (content !== null) updates.content = content;
		if (title) updates.title = title;

		typedDb.update(documents).set(updates).where(eq(documents.id, id)).run();

		return { success: true };
	},

	deleteDocument: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return { success: false, error: 'Missing document id' };

		if (isMock || !db) {
			return { success: true };
		}

		// Require owner role to delete
		await requireDocumentRole(db, locals.user?.id, id, 'owner');

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		typedDb.delete(documents).where(eq(documents.id, id)).run();

		return { success: true };
	}
};
