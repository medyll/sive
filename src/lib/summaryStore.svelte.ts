import { browser } from '$app/environment';

const STORAGE_KEY = 'sive.summaries';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export type SummaryLength = 'short' | 'medium' | 'long';

interface CacheEntry {
	text: string;
	ts: number;
}

type DocCache = Partial<Record<SummaryLength, CacheEntry>>;
type CacheMap = Record<string, DocCache>;

function loadFromStorage(): CacheMap {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as CacheMap;
	} catch {
		return {};
	}
}

function saveToStorage(cache: CacheMap): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

function createSummaryStore() {
	let cache = $state<CacheMap>(loadFromStorage());

	function get(docId: string, length: SummaryLength): string | null {
		const entry = cache[docId]?.[length];
		if (!entry) return null;
		if (Date.now() - entry.ts > TTL_MS) return null;
		return entry.text;
	}

	function getTs(docId: string, length: SummaryLength): number | null {
		const entry = cache[docId]?.[length];
		if (!entry) return null;
		if (Date.now() - entry.ts > TTL_MS) return null;
		return entry.ts;
	}

	function set(docId: string, length: SummaryLength, text: string): void {
		const existing: DocCache = cache[docId] ?? {};
		cache = { ...cache, [docId]: { ...existing, [length]: { text, ts: Date.now() } } };
		saveToStorage(cache);
	}

	function refreshSummary(docId: string, length: SummaryLength): void {
		const existing: DocCache = { ...(cache[docId] ?? {}) };
		delete existing[length];
		cache = { ...cache, [docId]: existing };
		saveToStorage(cache);
	}

	function prune(): void {
		const now = Date.now();
		const updated: CacheMap = {};
		for (const [docId, lengths] of Object.entries(cache)) {
			const fresh = Object.fromEntries(
				Object.entries(lengths).filter(([, v]) => now - (v as CacheEntry).ts <= TTL_MS)
			) as DocCache;
			if (Object.keys(fresh).length > 0) updated[docId] = fresh;
		}
		cache = updated;
		saveToStorage(cache);
	}

	return { get, getTs, set, refreshSummary, prune };
}

export const summaryStore = createSummaryStore();
