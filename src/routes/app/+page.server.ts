import { db, isMock } from '$lib/server/db';
import { documents } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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
	const userId = (locals as Record<string, unknown> & { user?: { id: string } }).user?.id ?? GUEST_USER_ID;

	if (isMock || !db) {
		return { documents: STUB_DOCUMENTS, activeDocumentId: STUB_DOCUMENTS[0].id };
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typedDb = db as any;
	const docs = typedDb.select().from(documents).where(eq(documents.user_id, userId)).all();

	if (docs.length === 0) {
		const newDoc = {
			id: crypto.randomUUID(),
			user_id: userId,
			title: 'Untitled',
			content: '',
			created_at: Date.now(),
			updated_at: Date.now()
		};
		typedDb.insert(documents).values(newDoc).run();
		return { documents: [newDoc], activeDocumentId: newDoc.id };
	}

	return { documents: docs, activeDocumentId: docs[0].id };
};

export const actions: Actions = {
	createDocument: async ({ locals }) => {
		const userId = (locals as Record<string, unknown> & { user?: { id: string } }).user?.id ?? GUEST_USER_ID;

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

	updateDocument: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const content = data.get('content') as string;
		const title = data.get('title') as string | null;

		if (!id) return { success: false, error: 'Missing document id' };

		if (isMock || !db) {
			return { success: true };
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedDb = db as any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updates: Record<string, any> = { content, updated_at: Date.now() };
		if (title) updates.title = title;

		typedDb.update(documents).set(updates).where(eq(documents.id, id)).run();

		return { success: true };
	}
};
