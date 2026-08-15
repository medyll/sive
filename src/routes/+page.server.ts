import { db, isMock } from '$lib/server/db';
import { documents } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, json } from '@sveltejs/kit';
import { requireDocumentRole } from '$lib/server/rbac';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';
import {
  validateDocumentTitle,
  validateDocumentContent,
  validateDocumentID,
  validateDocumentFormData
} from '$lib/server/inputValidation';
import type { PageServerLoad, Actions } from './$types';
import { existsSync } from 'node:fs';

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

export const load: PageServerLoad = async ({ locals, cookies }) => {
	// In production mode (real DB + auth), require authentication
	if (!isMock && !locals.user) {
		throw redirect(302, '/auth');
	}

	const userId = locals.user?.id ?? GUEST_USER_ID;

	// Allow forcing stub documents for e2e tests via environment variable or cookie
	if (process.env.FORCE_E2E_STUBS === 'true' || cookies.get('sive_e2e_mock') === '1') {
		return { documents: STUB_DOCUMENTS, activeDocumentId: STUB_DOCUMENTS[0].id, user: locals.user ?? null };
	}

	if (isMock || !db) {
		return { documents: STUB_DOCUMENTS, activeDocumentId: STUB_DOCUMENTS[0].id, user: locals.user ?? null };
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;

	try {
		// Documents are single-owner: everything this user owns, most recent first
		const ownedDocs: { id: string; updated_at: number }[] =
			typedDb.select().from(documents).where(eq(documents.user_id, userId)).all() ?? [];

		if (ownedDocs.length === 0) {
			// First visit — create a default document
			const newDoc = {
				id: crypto.randomUUID(),
				user_id: userId,
				title: 'Untitled',
				content: '',
				created_at: Date.now(),
				updated_at: Date.now()
			};
			typedDb.insert(documents).values(newDoc).run();
			return { documents: [{ ...newDoc, role: 'owner' }], activeDocumentId: newDoc.id };
		}

		const docs = ownedDocs
			.map((doc) => ({ ...doc, role: 'owner' }))
			.sort((a: { updated_at: number }, b: { updated_at: number }) => b.updated_at - a.updated_at);

		return { documents: docs, activeDocumentId: docs[0]?.id ?? null, user: locals.user ?? null, preferences: locals.preferences ?? null };
	} catch (err) {
		// If DB tables are missing or another DB error occurs, fall back to guest stub mode
		// eslint-disable-next-line no-console
		console.warn('DB access failed in load(): falling back to guest stubs:', (err as Error)?.message ?? err);
		return { documents: STUB_DOCUMENTS, activeDocumentId: STUB_DOCUMENTS[0].id, user: locals.user ?? null };
	}
};

export const actions: Actions = {
	createDocument: async (event) => {
		// Rate limit check
		const limit = checkWriteRateLimit(event);
		if (!limit.allowed) return limit.response;

		const { locals } = event;
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
		return { success: true, id: newDoc.id };
	},

	updateDocument: async (event) => {
		// Rate limit check
		const limit = checkWriteRateLimit(event);
		if (!limit.allowed) return limit.response;

		const { request, locals } = event;
		const data = await request.formData();

		// Validate form data
		const validation = validateDocumentFormData(data);
		if (!validation.valid) {
			return { success: false, error: validation.error };
		}

		const validatedData = validation.sanitized as { id: string; title: string | null; content: string | null };
		const { id, title, content } = validatedData;

		if (isMock || !db) {
			return { success: true };
		}

		// Only the owner may edit
		await requireDocumentRole(db, locals.user?.id, id);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updates: Record<string, any> = { updated_at: Date.now() };
		if (content !== null) updates.content = content;
		if (title) updates.title = title;

		typedDb.update(documents).set(updates).where(eq(documents.id, id)).run();

		return { success: true };
	},

	deleteDocument: async (event) => {
		// Rate limit check
		const limit = checkWriteRateLimit(event);
		if (!limit.allowed) return limit.response;

		const { request, locals } = event;
		const data = await request.formData();
		const id = data.get('id') as string;

		// Validate document ID
		const idValidation = validateDocumentID(id);
		if (!idValidation.valid) {
			return { success: false, error: idValidation.error };
		}

		if (isMock || !db) {
			return { success: true };
		}

		// Only the owner may delete
		await requireDocumentRole(db, locals.user?.id, idValidation.sanitized as string);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		typedDb.delete(documents).where(eq(documents.id, idValidation.sanitized as string)).run();

		return { success: true };
	},

	duplicateDocument: async (event) => {
		// Rate limit check
		const limit = checkWriteRateLimit(event);
		if (!limit.allowed) return limit.response;

		const { request, locals } = event;
		const data = await request.formData();
		const id = data.get('id') as string;

		// Validate document ID
		const idValidation = validateDocumentID(id);
		if (!idValidation.valid) {
			return { success: false, error: idValidation.error };
		}

		if (isMock || !db) {
			return { success: true, id: `stub-doc-${Date.now()}` };
		}

		const userId = locals.user?.id ?? GUEST_USER_ID;
		const validatedId = idValidation.sanitized as string;

		// Only the owner may duplicate
		await requireDocumentRole(db, userId, validatedId);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		const rows = typedDb.select().from(documents).where(eq(documents.id, validatedId)).all();
		if (!rows || rows.length === 0) return { success: false, error: 'Document not found' };

		const source = rows[0];
		const newDoc = {
			id: crypto.randomUUID(),
			user_id: userId,
			title: `Copy of ${source.title}`,
			content: source.content,
			created_at: Date.now(),
			updated_at: Date.now()
		};
		typedDb.insert(documents).values(newDoc).run();

		return { success: true, id: newDoc.id };
	}
};
