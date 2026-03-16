import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => { store[key] = value; },
		removeItem: (key: string) => { delete store[key]; },
		clear: () => { store = {}; }
	};
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Re-import after mock setup
const { tagStore } = await import('./tagStore.svelte.js');

describe('tagStore', () => {
	beforeEach(() => {
		localStorageMock.clear();
	});

	it('returns empty array for unknown docId', () => {
		expect(tagStore.get('doc-x')).toEqual([]);
	});

	it('adds a tag and retrieves it', () => {
		tagStore.add('doc-1', 'fantasy');
		expect(tagStore.get('doc-1')).toContain('fantasy');
	});

	it('does not add duplicate tags', () => {
		tagStore.set('doc-2', ['sci-fi']);
		tagStore.add('doc-2', 'sci-fi');
		expect(tagStore.get('doc-2').filter((t) => t === 'sci-fi').length).toBe(1);
	});

	it('enforces max 5 tags via set()', () => {
		tagStore.set('doc-3', ['a', 'b', 'c', 'd', 'e', 'f']);
		expect(tagStore.get('doc-3').length).toBe(5);
	});

	it('add() is a no-op when 5 tags already present', () => {
		tagStore.set('doc-4', ['a', 'b', 'c', 'd', 'e']);
		tagStore.add('doc-4', 'f');
		expect(tagStore.get('doc-4').length).toBe(5);
	});

	it('removes a tag', () => {
		tagStore.set('doc-5', ['horror', 'thriller']);
		tagStore.remove('doc-5', 'horror');
		expect(tagStore.get('doc-5')).not.toContain('horror');
		expect(tagStore.get('doc-5')).toContain('thriller');
	});

	it('persists to localStorage', () => {
		tagStore.set('doc-6', ['romance']);
		const raw = localStorageMock.getItem('sive.tags.doc-6');
		expect(JSON.parse(raw!)).toEqual(['romance']);
	});

	it('hydrates from JSON string', () => {
		tagStore.hydrate('doc-7', '["mystery","noir"]');
		expect(tagStore.get('doc-7')).toEqual(['mystery', 'noir']);
	});

	it('toJSON serialises correctly', () => {
		tagStore.set('doc-8', ['epic']);
		expect(JSON.parse(tagStore.toJSON('doc-8'))).toEqual(['epic']);
	});

	it('trims whitespace on add()', () => {
		tagStore.add('doc-9', '  adventure  ');
		expect(tagStore.get('doc-9')).toContain('adventure');
	});

	it('ignores blank tags on add()', () => {
		tagStore.add('doc-10', '   ');
		expect(tagStore.get('doc-10')).toEqual([]);
	});
});
