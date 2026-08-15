import { describe, it, expect, vi } from 'vitest';

// Mock drizzle-orm so eq produces a tagged object we can evaluate
vi.mock('drizzle-orm', () => ({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	eq: (col: any, val: unknown) => ({ type: 'eq', column: col, value: val })
}));

// Mock @sveltejs/kit error() so it throws a plain Error we can inspect
vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		const err = new Error(message) as Error & { status: number };
		err.status = status;
		throw err;
	}
}));

import { requireDocumentRole, getDocumentRole } from './rbac';

type DocumentRow = { id: string; user_id: string };

function createMockDb(rows: DocumentRow[]) {
	function evalCond(cond: unknown, row: DocumentRow): boolean {
		if (!cond || typeof cond !== 'object') return true;
		const c = cond as Record<string, unknown>;
		if (c.type === 'eq') {
			const col = c.column as Record<string, unknown>;
			return row[col.name as keyof DocumentRow] === c.value;
		}
		return true;
	}

	return {
		select: () => ({
			from: (_table: unknown) => ({
				where: (cond: unknown) => ({
					get: () => rows.find((r) => evalCond(cond, r))
				})
			})
		})
	};
}

const DOCS: DocumentRow[] = [
	{ id: 'doc1', user_id: 'user1' },
	{ id: 'doc2', user_id: 'user2' }
];

describe('getDocumentRole', () => {
	it('returns owner for the document owner', async () => {
		await expect(getDocumentRole(createMockDb(DOCS), 'user1', 'doc1')).resolves.toBe('owner');
	});

	it('returns null for a user who does not own the document', async () => {
		await expect(getDocumentRole(createMockDb(DOCS), 'user2', 'doc1')).resolves.toBeNull();
	});

	it('returns null for an unknown document', async () => {
		await expect(getDocumentRole(createMockDb(DOCS), 'user1', 'nope')).resolves.toBeNull();
	});

	it('returns null when no database is available', async () => {
		await expect(getDocumentRole(null, 'user1', 'doc1')).resolves.toBeNull();
	});
});

describe('requireDocumentRole', () => {
	it('rejects with 401 when no user is authenticated', async () => {
		await expect(requireDocumentRole(createMockDb(DOCS), undefined, 'doc1')).rejects.toMatchObject({
			status: 401
		});
	});

	it('rejects with 403 when the user does not own the document', async () => {
		await expect(requireDocumentRole(createMockDb(DOCS), 'user2', 'doc1')).rejects.toMatchObject({
			status: 403
		});
	});

	it('rejects with 403 for an unknown document', async () => {
		await expect(requireDocumentRole(createMockDb(DOCS), 'user1', 'nope')).rejects.toMatchObject({
			status: 403
		});
	});

	it('resolves to owner for the document owner', async () => {
		await expect(requireDocumentRole(createMockDb(DOCS), 'user1', 'doc1')).resolves.toBe('owner');
	});
});
