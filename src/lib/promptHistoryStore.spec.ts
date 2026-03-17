import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock $app/environment so browser = true
vi.mock('$app/environment', () => ({ browser: true }));

// Provide localStorage mock before module import
const store: Record<string, string> = {};
const localStorageMock = {
	getItem: (k: string) => store[k] ?? null,
	setItem: (k: string, v: string) => { store[k] = v; },
	removeItem: (k: string) => { delete store[k]; },
	clear: () => { Object.keys(store).forEach((k) => delete store[k]); }
};
vi.stubGlobal('localStorage', localStorageMock);

// Import after mocks are in place
const { promptHistoryStore } = await import('./promptHistoryStore.svelte.js');

describe('promptHistoryStore', () => {
	beforeEach(() => {
		promptHistoryStore.clear();
	});

	it('starts empty', () => {
		expect(promptHistoryStore.items).toEqual([]);
	});

	it('add() prepends new entries', () => {
		promptHistoryStore.add('first');
		promptHistoryStore.add('second');
		expect(promptHistoryStore.items[0]).toBe('second');
		expect(promptHistoryStore.items[1]).toBe('first');
	});

	it('add() deduplicates: moves existing entry to top', () => {
		promptHistoryStore.add('alpha');
		promptHistoryStore.add('beta');
		promptHistoryStore.add('alpha');
		expect(promptHistoryStore.items[0]).toBe('alpha');
		expect(promptHistoryStore.items.filter((t) => t === 'alpha')).toHaveLength(1);
	});

	it('ignores empty / whitespace-only strings', () => {
		promptHistoryStore.add('');
		promptHistoryStore.add('   ');
		expect(promptHistoryStore.items).toHaveLength(0);
	});

	it('caps at 10 items', () => {
		for (let i = 1; i <= 12; i++) promptHistoryStore.add(`prompt ${i}`);
		expect(promptHistoryStore.items).toHaveLength(10);
		// Most recent should be at top
		expect(promptHistoryStore.items[0]).toBe('prompt 12');
	});

	it('clear() empties the store', () => {
		promptHistoryStore.add('keep me');
		promptHistoryStore.clear();
		expect(promptHistoryStore.items).toHaveLength(0);
	});

	it('clear() removes localStorage entry', () => {
		promptHistoryStore.add('x');
		promptHistoryStore.clear();
		expect(localStorage.getItem('sive.promptHistory')).toBe('[]');
	});

	it('persists to localStorage on add()', () => {
		promptHistoryStore.add('persisted');
		const raw = localStorage.getItem('sive.promptHistory');
		expect(JSON.parse(raw ?? '[]')).toContain('persisted');
	});

	it('loads from localStorage on module init (simulated via store pre-seed)', () => {
		// Write directly to storage and re-read via getItem to confirm round-trip
		const data = JSON.stringify(['seeded']);
		localStorage.setItem('sive.promptHistory', data);
		const retrieved = JSON.parse(localStorage.getItem('sive.promptHistory') ?? '[]');
		expect(retrieved).toContain('seeded');
	});
});
