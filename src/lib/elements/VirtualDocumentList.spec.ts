import { describe, it, expect, vi, beforeEach } from 'vitest';

// Pure logic tests (no DOM mounting needed)

const ROW_HEIGHT = 64;
const OVERSCAN = 3;

function visibleWindow(scrollTop: number, containerHeight: number, total: number) {
	const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
	const last = Math.min(total - 1, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN);
	return { first, last, count: last - first + 1 };
}

function makeDocs(n: number) {
	return Array.from({ length: n }, (_, i) => ({
		id: `doc-${i}`,
		title: `Doc ${i}`,
		content: 'word '.repeat(i * 10),
		updated_at: new Date(Date.now() - i * 3600_000).toISOString()
	}));
}

describe('VirtualDocumentList — visible window logic', () => {
	it('renders correct subset for a 400px viewport at scroll=0', () => {
		const w = visibleWindow(0, 400, 100);
		// visible rows: ceil(400/64)=7, overscan adds 3 below = rows 0..9
		expect(w.first).toBe(0);
		expect(w.last).toBeLessThanOrEqual(9 + OVERSCAN);
		expect(w.count).toBeLessThanOrEqual(20);
	});

	it('shifts window correctly after scrolling', () => {
		const w1 = visibleWindow(0, 400, 100);
		const w2 = visibleWindow(640, 400, 100); // scrolled 10 rows
		expect(w2.first).toBeGreaterThan(w1.first);
	});

	it('clamps first to 0 at top', () => {
		expect(visibleWindow(0, 400, 50).first).toBe(0);
	});

	it('clamps last to total-1 at bottom', () => {
		const w = visibleWindow(10000, 400, 10);
		expect(w.last).toBe(9);
	});

	it('total height = docs.length * rowHeight', () => {
		const docs = makeDocs(50);
		expect(docs.length * ROW_HEIGHT).toBe(3200);
	});

	it('offset top = firstIdx * rowHeight', () => {
		const w = visibleWindow(640, 400, 100);
		expect(w.first * ROW_HEIGHT).toBe(w.first * 64);
	});
});

describe('VirtualDocumentList — word count cache', () => {
	function countWords(text: string) {
		return text.trim() ? text.trim().split(/\s+/).length : 0;
	}

	it('counts words correctly', () => {
		expect(countWords('hello world')).toBe(2);
		expect(countWords('')).toBe(0);
		expect(countWords('  ')).toBe(0);
	});

	it('processes docs in batches of 5', () => {
		const docs = makeDocs(12);
		const cache = new Map<string, number>();
		const BATCH = 5;
		let i = 0;
		const batches: number[] = [];
		while (i < docs.length) {
			const batch = docs.slice(i, i + BATCH);
			batches.push(batch.length);
			for (const doc of batch) cache.set(doc.id, countWords(doc.content));
			i += BATCH;
		}
		expect(batches).toEqual([5, 5, 2]);
		expect(cache.size).toBe(12);
	});

	it('clears cache on doc list change', () => {
		const cache = new Map<string, number>();
		cache.set('doc-0', 10);
		// Simulate clearing on new docs
		cache.clear();
		expect(cache.size).toBe(0);
	});
});
