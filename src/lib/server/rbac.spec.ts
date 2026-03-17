import { describe, it, expect, vi } from 'vitest';

// Mock drizzle-orm so eq/and produce tagged objects
vi.mock('drizzle-orm', () => ({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	eq: (col: any, val: unknown) => ({ type: 'eq', column: col, value: val }),
	and: (...conds: unknown[]) => ({ type: 'and', conditions: conds })
}));

// Mock @sveltejs/kit error() so it throws a plain Error we can inspect
vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		const err = new Error(message) as Error & { status: number };
		err.status = status;
		throw err;
	}
}));

import { requireDocumentRole } from './rbac';
import { createOwnerShare, upsertShare } from './shares';
import type { DocumentRole } from './shares';

// --- Shared mock DB (same pattern as shares.spec.ts) ---
type ShareRow = {
	id: string;
	document_id: string;
	user_id: string;
	role: DocumentRole;
	created_at: number;
};

function createMockDb() {
	const rows: ShareRow[] = [];

	function evalCond(cond: unknown, row: ShareRow): boolean {
		if (!cond || typeof cond !== 'object') return true;
		const c = cond as Record<string, unknown>;
		if (c.type === 'and' && Array.isArray(c.conditions)) {
			return (c.conditions as unknown[]).every((sub) => evalCond(sub, row));
		}
		if (c.type === 'eq') {
			const col = c.column as Record<string, unknown>;
			return row[col.name as keyof ShareRow] === c.value;
		}
		return true;
	}

	return {
		_rows: rows,
		select: () => ({
			from: (_table: unknown) => ({
				where: (cond: unknown) => ({
					all: () => rows.filter((r) => evalCond(cond, r))
				})
			})
		}),
		insert: (_table: unknown) => ({
			values: (v: Partial<ShareRow>) => {
				const record: ShareRow = {
					id: v.id ?? crypto.randomUUID(),
					document_id: v.document_id!,
					user_id: v.user_id!,
					role: v.role ?? 'viewer',
					created_at: v.created_at ?? Date.now()
				};
				return {
					run: () => {
						const existing = rows.findIndex(
							(r) => r.document_id === record.document_id && r.user_id === record.user_id
						);
						if (existing < 0) rows.push(record);
					},
					onConflictDoUpdate: () => ({
						run: () => {
							const existing = rows.findIndex(
								(r) => r.document_id === record.document_id && r.user_id === record.user_id
							);
							if (existing >= 0) rows[existing].role = record.role;
							else rows.push(record);
						}
					})
				};
			}
		}),
		delete: (_table: unknown) => ({
			where: (cond: unknown) => ({
				run: () => {
					const idx = rows.findIndex((r) => evalCond(cond, r));
					if (idx >= 0) rows.splice(idx, 1);
				}
			})
		})
	};
}

describe('requireDocumentRole', () => {
	it('throws 401 when userId is undefined', async () => {
		const mockDb = createMockDb();
		await expect(requireDocumentRole(mockDb, undefined, 'doc1', 'viewer')).rejects.toMatchObject({
			status: 401
		});
	});

	it('throws 403 when user has no share record', async () => {
		const mockDb = createMockDb();
		await expect(requireDocumentRole(mockDb, 'nobody', 'doc1', 'viewer')).rejects.toMatchObject({
			status: 403
		});
	});

	it('returns role when user meets minimum (owner requires owner)', async () => {
		const mockDb = createMockDb();
		createOwnerShare(mockDb, 'doc1', 'user1');
		const role = await requireDocumentRole(mockDb, 'user1', 'doc1', 'owner');
		expect(role).toBe('owner');
	});

	it('owner passes editor minimum', async () => {
		const mockDb = createMockDb();
		createOwnerShare(mockDb, 'doc1', 'user1');
		const role = await requireDocumentRole(mockDb, 'user1', 'doc1', 'editor');
		expect(role).toBe('owner');
	});

	it('owner passes viewer minimum', async () => {
		const mockDb = createMockDb();
		createOwnerShare(mockDb, 'doc1', 'user1');
		const role = await requireDocumentRole(mockDb, 'user1', 'doc1', 'viewer');
		expect(role).toBe('owner');
	});

	it('editor passes editor minimum', async () => {
		const mockDb = createMockDb();
		upsertShare(mockDb, 'doc1', 'user2', 'editor');
		const role = await requireDocumentRole(mockDb, 'user2', 'doc1', 'editor');
		expect(role).toBe('editor');
	});

	it('editor passes viewer minimum', async () => {
		const mockDb = createMockDb();
		upsertShare(mockDb, 'doc1', 'user2', 'editor');
		const role = await requireDocumentRole(mockDb, 'user2', 'doc1', 'viewer');
		expect(role).toBe('editor');
	});

	it('editor fails owner minimum', async () => {
		const mockDb = createMockDb();
		upsertShare(mockDb, 'doc1', 'user2', 'editor');
		await expect(requireDocumentRole(mockDb, 'user2', 'doc1', 'owner')).rejects.toMatchObject({
			status: 403
		});
	});

	it('viewer passes viewer minimum', async () => {
		const mockDb = createMockDb();
		upsertShare(mockDb, 'doc1', 'user3', 'viewer');
		const role = await requireDocumentRole(mockDb, 'user3', 'doc1', 'viewer');
		expect(role).toBe('viewer');
	});

	it('viewer fails editor minimum', async () => {
		const mockDb = createMockDb();
		upsertShare(mockDb, 'doc1', 'user3', 'viewer');
		await expect(requireDocumentRole(mockDb, 'user3', 'doc1', 'editor')).rejects.toMatchObject({
			status: 403
		});
	});

	it('viewer fails owner minimum', async () => {
		const mockDb = createMockDb();
		upsertShare(mockDb, 'doc1', 'user3', 'viewer');
		await expect(requireDocumentRole(mockDb, 'user3', 'doc1', 'owner')).rejects.toMatchObject({
			status: 403
		});
	});

	it('user with access to doc1 cannot access doc2', async () => {
		const mockDb = createMockDb();
		createOwnerShare(mockDb, 'doc1', 'user1');
		await expect(requireDocumentRole(mockDb, 'user1', 'doc2', 'viewer')).rejects.toMatchObject({
			status: 403
		});
	});
});
