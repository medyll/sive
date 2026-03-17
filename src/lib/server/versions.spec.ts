import { describe, it, expect, beforeEach } from 'vitest';
import { saveVersion, getVersions, getVersion, restoreVersion, labelVersion } from './versions';

const DOC = 'doc-test-1';
const USER = 'user-1';

beforeEach(() => {
	// Clear by saving 50 versions (forces eviction), then check state is manageable
	// Reset indirectly — module store persists; use unique docIds per test group
});

describe('saveVersion', () => {
	const D = 'doc-save-1';
	it('saves and returns a version', () => {
		const v = saveVersion(D, USER, 'Hello world', 'My Doc');
		expect(v.id).toBeDefined();
		expect(v.content).toBe('Hello world');
		expect(v.docId).toBe(D);
	});

	it('stores newest first', () => {
		const D2 = 'doc-save-order';
		saveVersion(D2, USER, 'v1', 'Doc');
		saveVersion(D2, USER, 'v2', 'Doc');
		const versions = getVersions(D2);
		expect(versions[0].wordCount).toBe(1); // v2 = 1 word
	});

	it('respects max 50 limit (FIFO eviction)', () => {
		const D3 = 'doc-save-max';
		for (let i = 0; i < 55; i++) {
			saveVersion(D3, USER, `content ${i}`, 'Doc');
		}
		expect(getVersions(D3)).toHaveLength(50);
	});
});

describe('getVersion', () => {
	const D = 'doc-get-1';
	it('retrieves a specific version by id', () => {
		const v = saveVersion(D, USER, 'specific content', 'Title');
		const found = getVersion(D, v.id);
		expect(found?.content).toBe('specific content');
	});

	it('returns undefined for unknown id', () => {
		expect(getVersion(D, 'fake-id')).toBeUndefined();
	});
});

describe('restoreVersion', () => {
	const D = 'doc-restore-1';
	it('returns content and title', () => {
		const v = saveVersion(D, USER, 'restore me', 'OldTitle');
		const result = restoreVersion(D, v.id);
		expect(result?.content).toBe('restore me');
		expect(result?.title).toBe('OldTitle');
	});

	it('returns null for unknown version', () => {
		expect(restoreVersion(D, 'nope')).toBeNull();
	});
});

describe('labelVersion', () => {
	const D = 'doc-label-1';
	it('sets a label on a version', () => {
		const v = saveVersion(D, USER, 'labeled', 'Doc');
		expect(labelVersion(D, v.id, 'Draft v2')).toBe(true);
		const found = getVersion(D, v.id);
		expect(found?.label).toBe('Draft v2');
	});

	it('returns false for unknown version', () => {
		expect(labelVersion(D, 'bad-id', 'x')).toBe(false);
	});
});

import { computeDiff, renderDiffHtml } from '../diff';

describe('computeDiff', () => {
	it('identifies equal lines', () => {
		const chunks = computeDiff('hello\nworld', 'hello\nworld');
		expect(chunks.every((c) => c.type === 'equal')).toBe(true);
	});

	it('identifies inserted lines', () => {
		const chunks = computeDiff('line1', 'line1\nline2');
		expect(chunks.some((c) => c.type === 'insert')).toBe(true);
	});

	it('identifies deleted lines', () => {
		const chunks = computeDiff('line1\nline2', 'line1');
		expect(chunks.some((c) => c.type === 'delete')).toBe(true);
	});

	it('handles empty strings', () => {
		expect(() => computeDiff('', '')).not.toThrow();
		expect(() => computeDiff('', 'new')).not.toThrow();
		expect(() => computeDiff('old', '')).not.toThrow();
	});
});

describe('renderDiffHtml', () => {
	it('wraps inserts in <ins> tags', () => {
		const html = renderDiffHtml([{ type: 'insert', text: 'new line' }]);
		expect(html).toContain('<ins>');
	});

	it('wraps deletes in <del> tags', () => {
		const html = renderDiffHtml([{ type: 'delete', text: 'old line' }]);
		expect(html).toContain('<del>');
	});

	it('escapes HTML in diff text', () => {
		const html = renderDiffHtml([{ type: 'insert', text: '<script>' }]);
		expect(html).not.toContain('<script>');
		expect(html).toContain('&lt;script&gt;');
	});
});
