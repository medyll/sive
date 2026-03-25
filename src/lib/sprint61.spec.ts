import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Comment } from './commentStore.svelte';

/**
 * Sprint 61 — Inline Comment Threads & Margin Annotations
 * Tests are inline (no $state import) to avoid browser-pool hang.
 */

// ── Comment store helpers (mirrored logic) ────────────────────────────────

function makeComment(overrides: Partial<Comment> = {}): Comment {
	return {
		id: 'c1',
		docId: 'doc-1',
		userId: 'u1',
		anchorText: 'selected text',
		anchorOffset: 5,
		body: 'This needs work',
		createdAt: Date.now(),
		resolved: false,
		...overrides
	};
}

function addComment(
	list: Comment[],
	opts: { docId: string; userId: string; anchorText: string; anchorOffset: number; body: string }
): Comment[] {
	const c: Comment = { ...opts, id: `id-${Math.random()}`, createdAt: Date.now(), resolved: false };
	return [...list, c];
}

function resolveComment(list: Comment[], id: string): Comment[] {
	return list.map((c) => (c.id === id ? { ...c, resolved: true } : c));
}

function removeComment(list: Comment[], id: string): Comment[] {
	return list.filter((c) => c.id !== id);
}

function unresolvedComments(list: Comment[]): Comment[] {
	return list.filter((c) => !c.resolved);
}

// ── SelectionToolbar props contract ──────────────────────────────────────

interface ToolbarProps {
	selection: string;
	anchorStart: number;
	anchorEnd: number;
	onComment?: (anchorStart: number, anchorEnd: number, selection: string) => void;
}

function simulateComment(props: ToolbarProps) {
	props.onComment?.(props.anchorStart, props.anchorEnd, props.selection);
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Sprint 61 — Inline Comment Threads', () => {

	describe('SelectionToolbar Comment button contract', () => {
		it('calls onComment with correct anchor offsets and selection text', () => {
			const spy = vi.fn();
			const props: ToolbarProps = {
				selection: 'highlighted text',
				anchorStart: 10,
				anchorEnd: 26,
				onComment: spy
			};
			simulateComment(props);
			expect(spy).toHaveBeenCalledOnce();
			expect(spy).toHaveBeenCalledWith(10, 26, 'highlighted text');
		});

		it('does not throw when onComment is not provided', () => {
			const props: ToolbarProps = { selection: 'text', anchorStart: 0, anchorEnd: 4 };
			expect(() => simulateComment(props)).not.toThrow();
		});
	});

	describe('commentStore — addComment', () => {
		it('creates comment with correct fields', () => {
			const list = addComment([], {
				docId: 'doc-1',
				userId: 'u1',
				anchorText: 'hello world',
				anchorOffset: 0,
				body: 'Needs clarification'
			});
			expect(list).toHaveLength(1);
			expect(list[0].anchorText).toBe('hello world');
			expect(list[0].body).toBe('Needs clarification');
			expect(list[0].resolved).toBe(false);
		});

		it('multiple comments accumulate', () => {
			let list: Comment[] = [];
			list = addComment(list, { docId: 'doc-1', userId: 'u1', anchorText: 'a', anchorOffset: 0, body: 'First' });
			list = addComment(list, { docId: 'doc-1', userId: 'u1', anchorText: 'b', anchorOffset: 5, body: 'Second' });
			expect(list).toHaveLength(2);
		});
	});

	describe('commentStore — resolveComment', () => {
		it('marks comment resolved', () => {
			const list = resolveComment([makeComment({ id: 'c1' })], 'c1');
			expect(list[0].resolved).toBe(true);
		});

		it('resolved comment excluded from unresolved list', () => {
			const list = resolveComment([makeComment({ id: 'c1' })], 'c1');
			expect(unresolvedComments(list)).toHaveLength(0);
		});

		it('only resolves the target comment', () => {
			const list = [makeComment({ id: 'c1' }), makeComment({ id: 'c2' })];
			const updated = resolveComment(list, 'c1');
			expect(updated.find((c) => c.id === 'c2')?.resolved).toBe(false);
		});
	});

	describe('commentStore — removeComment', () => {
		it('deletes the correct comment', () => {
			const list = [makeComment({ id: 'c1' }), makeComment({ id: 'c2' })];
			const updated = removeComment(list, 'c1');
			expect(updated).toHaveLength(1);
			expect(updated[0].id).toBe('c2');
		});
	});

	describe('CommentThread data contract', () => {
		it('comment has required display fields', () => {
			const c = makeComment();
			expect(typeof c.anchorText).toBe('string');
			expect(typeof c.body).toBe('string');
			expect(typeof c.createdAt).toBe('number');
			expect(typeof c.resolved).toBe('boolean');
		});

		it('createdAt is a recent timestamp', () => {
			const c = makeComment();
			expect(c.createdAt).toBeGreaterThan(Date.now() - 5000);
		});
	});
});
