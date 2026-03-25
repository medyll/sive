/**
 * commentStore — inline comment threads anchored to text ranges.
 *
 * Stored in localStorage under `sive.comments.<docId>`.
 * API matches CommentSidebar and CommentThread component expectations.
 */

const LS_PREFIX = 'sive.comments.';

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

function readLS(docId: string): Comment[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(LS_PREFIX + docId) ?? '[]') as Comment[];
	} catch {
		return [];
	}
}

function writeLS(docId: string, comments: Comment[]): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(LS_PREFIX + docId, JSON.stringify(comments));
}

function uid(): string {
	return Math.random().toString(36).slice(2, 10);
}

let _activeDocId = $state<string>('');
let _comments = $state<Comment[]>([]);

export const commentStore = {
	/** Load comments for a document into reactive state. */
	loadDoc(docId: string): void {
		_activeDocId = docId;
		_comments = readLS(docId);
	},

	/** All unresolved comments for the active document. */
	get unresolved(): Comment[] {
		return _comments.filter((c) => !c.resolved);
	},

	/** All comments for the active document. */
	get all(): Comment[] {
		return _comments;
	},

	/** Add a new comment. */
	add(opts: {
		docId: string;
		userId: string;
		anchorText: string;
		anchorOffset: number;
		body: string;
	}): Comment {
		const comment: Comment = {
			id: uid(),
			docId: opts.docId,
			userId: opts.userId,
			anchorText: opts.anchorText,
			anchorOffset: opts.anchorOffset,
			body: opts.body,
			createdAt: Date.now(),
			resolved: false
		};
		_comments = [..._comments, comment];
		writeLS(opts.docId, _comments);
		return comment;
	},

	/** Mark a comment as resolved. */
	resolve(id: string): void {
		_comments = _comments.map((c) => (c.id === id ? { ...c, resolved: true } : c));
		if (_activeDocId) writeLS(_activeDocId, _comments);
	},

	/** Remove a comment entirely. */
	remove(id: string): void {
		_comments = _comments.filter((c) => c.id !== id);
		if (_activeDocId) writeLS(_activeDocId, _comments);
	}
};
