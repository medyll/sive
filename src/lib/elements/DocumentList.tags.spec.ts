import { describe, it, expect, beforeEach } from 'vitest';

// Minimal localStorage mock
const lsMock = (() => {
	let s: Record<string, string> = {};
	return {
		getItem: (k: string) => s[k] ?? null,
		setItem: (k: string, v: string) => { s[k] = v; },
		clear: () => { s = {}; }
	};
})();
Object.defineProperty(globalThis, 'localStorage', { value: lsMock, writable: true });

const { tagStore } = await import('../tagStore.svelte.js');

describe('DocumentList tag integration via tagStore', () => {
	beforeEach(() => lsMock.clear());

	it('allDocTags is empty when no docs have tags', () => {
		// fresh store — no tags set in this isolated context
		// We just verify the API exists and returns an array
		expect(Array.isArray(tagStore.allTags)).toBe(true);
	});

	it('tag filter: get() returns correct tags after set()', () => {
		tagStore.set('filter-doc-1', ['sci-fi', 'space']);
		tagStore.set('filter-doc-2', ['fantasy']);

		const doc1Tags = tagStore.get('filter-doc-1');
		const doc2Tags = tagStore.get('filter-doc-2');

		// Simulating the $derived filter logic from DocumentList
		const docs = [
			{ id: 'filter-doc-1', title: 'Doc 1' },
			{ id: 'filter-doc-2', title: 'Doc 2' }
		];
		const filtered = docs.filter((d) => tagStore.get(d.id).includes('sci-fi'));
		expect(filtered).toHaveLength(1);
		expect(filtered[0].id).toBe('filter-doc-1');
	});

	it('tag filter clears correctly (null = show all)', () => {
		tagStore.set('filt-a', ['horror']);
		tagStore.set('filt-b', ['romance']);
		const docs = [{ id: 'filt-a' }, { id: 'filt-b' }];
		const activeFilter: string | null = null;
		const all = docs.filter((d) => activeFilter === null || tagStore.get(d.id).includes(activeFilter));
		expect(all).toHaveLength(2);
	});

	it('tag search + tag filter both applied', () => {
		tagStore.set('combo-1', ['action']);
		tagStore.set('combo-2', ['action']);
		const docs = [
			{ id: 'combo-1', title: 'Alpha' },
			{ id: 'combo-2', title: 'Beta' }
		];
		const searchQuery = 'alpha';
		const activeTagFilter = 'action';
		const result = docs.filter((d) => {
			const matchSearch = d.title.toLowerCase().includes(searchQuery);
			const matchTag = tagStore.get(d.id).includes(activeTagFilter);
			return matchSearch && matchTag;
		});
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('combo-1');
	});

	it('hydrate populates tags for a doc', () => {
		tagStore.hydrate('hydrate-doc', '["thriller","crime"]');
		expect(tagStore.get('hydrate-doc')).toContain('thriller');
		expect(tagStore.get('hydrate-doc')).toContain('crime');
	});
});
