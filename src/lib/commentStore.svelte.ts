/**
 * Inline document comment store
 * Persists to localStorage; DB wire-up deferred to a future sprint.
 */

export interface Comment {
	id: string;
	docId: string;
	userId: string;
	anchorText: string;
	anchorOffset: number;
	body: string;
	createdAt: number;
	resolved: boolean;
}

function storageKey(docId: string) {
	return `sive:comments:${docId}`;
}

function load(docId: string): Comment[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(storageKey(docId)) ?? '[]');
	} catch {
		return [];
	}
}

function save(docId: string, comments: Comment[]) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(storageKey(docId), JSON.stringify(comments));
}

function createCommentStore() {
	let comments = $state<Comment[]>([]);
	let currentDocId = $state('');

	const unresolved = $derived(
		[...comments]
			.filter((c) => !c.resolved)
			.sort((a, b) => a.anchorOffset - b.anchorOffset)
	);

	function loadDoc(docId: string) {
		currentDocId = docId;
		comments = load(docId);
	}

	function add(partial: Omit<Comment, 'id' | 'createdAt' | 'resolved'>) {
		const comment: Comment = {
			...partial,
			id: crypto.randomUUID(),
			createdAt: Date.now(),
			resolved: false
		};
		comments = [...comments, comment];
		save(currentDocId, comments);
		return comment;
	}

	function resolve(id: string) {
		comments = comments.map((c) => (c.id === id ? { ...c, resolved: true } : c));
		save(currentDocId, comments);
	}

	function remove(id: string) {
		comments = comments.filter((c) => c.id !== id);
		save(currentDocId, comments);
	}

	return {
		get comments() { return comments; },
		get unresolved() { return unresolved; },
		loadDoc,
		add,
		resolve,
		remove
	};
}

export const commentStore = createCommentStore();
