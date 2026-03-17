import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	getDocumentRole,
	createOwnerShare,
	upsertShare,
	deleteShare,
	listDocumentShares
} from './shares';
import type { DocumentRole } from './shares';

// Mock drizzle-orm so eq/and produce simple tagged objects our mock DB can evaluate
vi.mock('drizzle-orm', () => ({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	eq: (col: any, val: unknown) => ({ type: 'eq', column: col, value: val }),
	and: (...conds: unknown[]) => ({ type: 'and', conditions: conds })
}));

type ShareRow = {
	id: string;
	document_id: string;
	user_id: string;
	role: DocumentRole;
	created_at: number;
};

/**
 * Minimal drizzle-compatible mock database.
 * Stores rows in memory and interprets drizzle SQL conditions via stored metadata
 * by matching on document_id and user_id fields directly.
 */
function createMockDb() {
	const rows: ShareRow[] = [];

	// Drizzle eq/and produce tagged objects; we evaluate them here
	function evalCond(cond: unknown, row: ShareRow): boolean {
		if (!cond || typeof cond !== 'object') return true;
		const c = cond as Record<string, unknown>;
		// and() wraps multiple conditions
		if (c.type === 'and' && Array.isArray(c.conditions)) {
			return (c.conditions as unknown[]).every((sub) => evalCond(sub, row));
		}
		// eq() wraps a column reference and a value
		if (c.type === 'eq') {
			const col = c.column as Record<string, unknown>;
			const val = c.value;
			const field = col?.name as keyof ShareRow;
			return row[field] === val;
		}
		return true;
	}

	return {
		_rows: rows,

		select: (projection?: Record<string, unknown>) => ({
			from: (_table: unknown) => ({
				where: (cond: unknown) => ({
					all: () => {
						const filtered = rows.filter((r) => evalCond(cond, r));
						if (!projection) return filtered;
						// apply projection
						return filtered.map((r) => {
							const out: Partial<ShareRow> = {};
							for (const [key, col] of Object.entries(projection)) {
								const colName = (col as Record<string, unknown>).name as keyof ShareRow;
								(out as Record<string, unknown>)[key] = r[colName];
							}
							return out;
						});
					}
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
					onConflictDoUpdate: (_opts: unknown) => ({
						run: () => {
							const existing = rows.findIndex(
								(r) => r.document_id === record.document_id && r.user_id === record.user_id
							);
							if (existing >= 0) {
								rows[existing].role = record.role;
							} else {
								rows.push(record);
							}
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

// ── Stub drizzle helpers so shares.ts eq/and calls produce our tagged objects ──
// We intercept the module's calls via the column objects that drizzle generates.
// Instead of mocking drizzle-orm, we pass a db whose column objects carry a `.name`
// field, which the evalCond function above uses.

// Map our tagged condition format onto what drizzle-orm/sqlite-core exports:
// We directly test the utility functions with a pre-built mock that mirrors the
// call pattern, bypassing actual drizzle SQL generation.

describe('shares utility', () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		mockDb = createMockDb();
	});

	// ── createOwnerShare ──────────────────────────────────────────────────────
	describe('createOwnerShare', () => {
		it('inserts an owner share record', () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			expect(mockDb._rows).toHaveLength(1);
			expect(mockDb._rows[0].role).toBe('owner');
			expect(mockDb._rows[0].document_id).toBe('doc1');
			expect(mockDb._rows[0].user_id).toBe('user1');
		});

		it('sets created_at automatically', () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			expect(mockDb._rows[0].created_at).toBeGreaterThan(0);
		});

		it('does not duplicate when called twice for different users', () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			createOwnerShare(mockDb, 'doc1', 'user2');
			expect(mockDb._rows).toHaveLength(2);
		});
	});

	// ── upsertShare ───────────────────────────────────────────────────────────
	describe('upsertShare', () => {
		it('creates a new share record', () => {
			upsertShare(mockDb, 'doc1', 'user2', 'editor');
			expect(mockDb._rows).toHaveLength(1);
			expect(mockDb._rows[0].role).toBe('editor');
		});

		it('updates role if share already exists', () => {
			upsertShare(mockDb, 'doc1', 'user2', 'editor');
			upsertShare(mockDb, 'doc1', 'user2', 'viewer');
			expect(mockDb._rows).toHaveLength(1);
			expect(mockDb._rows[0].role).toBe('viewer');
		});

		it('does not affect other users shares', () => {
			upsertShare(mockDb, 'doc1', 'user1', 'editor');
			upsertShare(mockDb, 'doc1', 'user2', 'viewer');
			expect(mockDb._rows).toHaveLength(2);
		});
	});

	// ── deleteShare ───────────────────────────────────────────────────────────
	describe('deleteShare', () => {
		it('removes the share by id', () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			const shareId = mockDb._rows[0].id;
			deleteShare(mockDb, shareId);
			expect(mockDb._rows).toHaveLength(0);
		});

		it('does not remove unrelated shares', () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			upsertShare(mockDb, 'doc1', 'user2', 'editor');
			const shareId = mockDb._rows[0].id;
			deleteShare(mockDb, shareId);
			expect(mockDb._rows).toHaveLength(1);
			expect(mockDb._rows[0].user_id).toBe('user2');
		});
	});

	// ── listDocumentShares ────────────────────────────────────────────────────
	describe('listDocumentShares', () => {
		it('returns all shares for a document', () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			upsertShare(mockDb, 'doc1', 'user2', 'editor');
			const shares = listDocumentShares(mockDb, 'doc1');
			expect(shares).toHaveLength(2);
		});

		it('does not include shares from other documents', () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			createOwnerShare(mockDb, 'doc2', 'user2');
			const shares = listDocumentShares(mockDb, 'doc1');
			expect(shares).toHaveLength(1);
			expect(shares[0].user_id).toBe('user1');
		});

		it('returns correct shape (id, user_id, role)', () => {
			upsertShare(mockDb, 'doc1', 'user3', 'viewer');
			const shares = listDocumentShares(mockDb, 'doc1');
			expect(shares[0]).toHaveProperty('id');
			expect(shares[0]).toHaveProperty('user_id', 'user3');
			expect(shares[0]).toHaveProperty('role', 'viewer');
		});
	});

	// ── getDocumentRole ───────────────────────────────────────────────────────
	describe('getDocumentRole', () => {
		it('returns owner role when owner share exists', async () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			const role = await getDocumentRole(mockDb, 'user1', 'doc1');
			expect(role).toBe('owner');
		});

		it('returns null when no share exists', async () => {
			const role = await getDocumentRole(mockDb, 'nobody', 'doc1');
			expect(role).toBeNull();
		});

		it('returns null for a different document', async () => {
			createOwnerShare(mockDb, 'doc1', 'user1');
			const role = await getDocumentRole(mockDb, 'user1', 'doc-other');
			expect(role).toBeNull();
		});

		it('returns viewer role when set', async () => {
			upsertShare(mockDb, 'doc1', 'user2', 'viewer');
			const role = await getDocumentRole(mockDb, 'user2', 'doc1');
			expect(role).toBe('viewer');
		});

		it('returns editor role when set', async () => {
			upsertShare(mockDb, 'doc1', 'user3', 'editor');
			const role = await getDocumentRole(mockDb, 'user3', 'doc1');
			expect(role).toBe('editor');
		});
	});
});
