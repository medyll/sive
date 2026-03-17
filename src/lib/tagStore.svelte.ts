/**
 * tagStore — lightweight document tagging.
 *
 * For authenticated users tags are persisted on the document record (documents.tags column).
 * For guests (or when no server action is available) tags are stored in localStorage under
 * the key `sive.tags.<docId>`.
 *
 * The store is used directly by DocumentList and the save actions.
 */

const LS_PREFIX = 'sive.tags.';
const MAX_TAGS = 5;

function readLS(docId: string): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(LS_PREFIX + docId) ?? '[]') as string[];
	} catch {
		return [];
	}
}

function writeLS(docId: string, tags: string[]): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(LS_PREFIX + docId, JSON.stringify(tags));
}

// In-memory reactive map: docId → tags[]
let _map = $state<Record<string, string[]>>({});

export const tagStore = {
	/** Get tags for a document (merges localStorage + in-memory). */
	get(docId: string): string[] {
		return _map[docId] ?? readLS(docId);
	},

	/** Set tags for a document (updates memory + localStorage). */
	set(docId: string, tags: string[]): void {
		const clamped = tags.slice(0, MAX_TAGS).map((t) => t.trim()).filter(Boolean);
		_map = { ..._map, [docId]: clamped };
		writeLS(docId, clamped);
	},

	/** Add a single tag (no-op if already present or limit reached). */
	add(docId: string, tag: string): void {
		const current = tagStore.get(docId);
		const trimmed = tag.trim();
		if (!trimmed || current.includes(trimmed) || current.length >= MAX_TAGS) return;
		tagStore.set(docId, [...current, trimmed]);
	},

	/** Remove a single tag. */
	remove(docId: string, tag: string): void {
		tagStore.set(docId, tagStore.get(docId).filter((t) => t !== tag));
	},

	/** Hydrate from server-side tags JSON string (call after document load). */
	hydrate(docId: string, tagsJson: string): void {
		try {
			const parsed = JSON.parse(tagsJson) as string[];
			if (Array.isArray(parsed)) {
				_map = { ..._map, [docId]: parsed };
			}
		} catch {
			// ignore
		}
	},

	/** Serialise tags for persisting to the server. */
	toJSON(docId: string): string {
		return JSON.stringify(tagStore.get(docId));
	},

	/** All unique tags across all known documents (for the filter bar). */
	get allTags(): string[] {
		const set = new Set<string>();
		for (const tags of Object.values(_map)) {
			for (const t of tags) set.add(t);
		}
		return [...set].sort();
	}
};
