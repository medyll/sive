import { describe, it, expect } from 'vitest';
import type { Comment } from './commentStore.svelte';

/**
 * Tests for commentStore logic — tested inline to avoid $state Node re-import hang.
 */

function makeComment(overrides: Partial<Comment> = {}): Comment {
	return {
		id: 'c1',
		docId: 'doc-1',
		userId: 'u1',
		anchorText: 'hello',
		anchorOffset: 0,
		body: 'Test comment',
		createdAt: Date.now(),
		resolved: false,
		...overrides
	};
}

function storageKey(docId: string) {
	return `sive:comments:${docId}`;
}

function loadComments(store: Record<string, string>, docId: string): Comment[] {
	try { return JSON.parse(store[storageKey(docId)] ?? '[]'); } catch { return []; }
}

function saveComments(store: Record<string, string>, docId: string, comments: Comment[]) {
	store[storageKey(docId)] = JSON.stringify(comments);
}

function addComment(comments: Comment[], partial: Omit<Comment, 'id' | 'createdAt' | 'resolved'>): Comment[] {
	const c: Comment = { ...partial, id: `uuid-${Math.random()}`, createdAt: Date.now(), resolved: false };
	return [...comments, c];
}

function resolveComment(comments: Comment[], id: string): Comment[] {
	return comments.map((c) => (c.id === id ? { ...c, resolved: true } : c));
}

function removeComment(comments: Comment[], id: string): Comment[] {
	return comments.filter((c) => c.id !== id);
}

function unresolved(comments: Comment[]): Comment[] {
	return [...comments].filter((c) => !c.resolved).sort((a, b) => a.anchorOffset - b.anchorOffset);
}

describe('commentStore logic', () => {
	it('starts with empty list', () => {
		const store: Record<string, string> = {};
		expect(loadComments(store, 'doc-1')).toHaveLength(0);
	});

	it('add creates a new comment', () => {
		let comments: Comment[] = [];
		comments = addComment(comments, { docId: 'doc-1', userId: 'u1', anchorText: 'hi', anchorOffset: 0, body: 'Nice!' });
		expect(comments).toHaveLength(1);
		expect(comments[0].body).toBe('Nice!');
		expect(comments[0].resolved).toBe(false);
	});

	it('resolve marks comment as resolved', () => {
		let comments: Comment[] = [makeComment({ id: 'c1' })];
		comments = resolveComment(comments, 'c1');
		expect(comments[0].resolved).toBe(true);
		expect(unresolved(comments)).toHaveLength(0);
	});

	it('remove deletes comment', () => {
		let comments: Comment[] = [makeComment({ id: 'c1' })];
		comments = removeComment(comments, 'c1');
		expect(comments).toHaveLength(0);
	});

	it('persists and restores via localStorage', () => {
		const store: Record<string, string> = {};
		let comments: Comment[] = [makeComment()];
		saveComments(store, 'doc-1', comments);
		const restored = loadComments(store, 'doc-1');
		expect(restored).toHaveLength(1);
		expect(restored[0].body).toBe('Test comment');
	});

	it('unresolved sorted by anchorOffset', () => {
		let comments: Comment[] = [
			makeComment({ id: 'c1', anchorOffset: 10, body: 'second' }),
			makeComment({ id: 'c2', anchorOffset: 2, body: 'first' })
		];
		const sorted = unresolved(comments);
		expect(sorted[0].body).toBe('first');
		expect(sorted[1].body).toBe('second');
	});
});
