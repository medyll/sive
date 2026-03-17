/**
 * Real-time cursor synchronization for collaborative editing
 */

import { writable, derived, type Readable } from 'svelte/store';

export interface CursorPosition {
	clientId: string;
	userId: string;
	line: number;
	column: number;
	selection?: {
		startLine: number;
		startColumn: number;
		endLine: number;
		endColumn: number;
	};
	color: string;
	lastUpdated: number;
}

export interface RemoteCursor extends CursorPosition {
	isVisible: boolean;
}

export function createCursorSyncStore() {
	const localCursor = writable<Omit<CursorPosition, 'clientId' | 'userId' | 'color' | 'lastUpdated'> | null>(null);
	const remoteCursors = writable<Map<string, RemoteCursor>>(new Map());

	let debounceTimer: NodeJS.Timeout | null = null;
	const DEBOUNCE_INTERVAL = 100;

	function updateLocalCursor(
		line: number,
		column: number,
		selection?: CursorPosition['selection']
	): void {
		localCursor.set({ line, column, selection });

		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			broadcastLocalCursor();
		}, DEBOUNCE_INTERVAL);
	}

	function broadcastLocalCursor(): void {
		localCursor.subscribe((cursor) => {
			if (!cursor) return;

			const message = { type: 'cursor', payload: cursor };

			if (typeof window !== 'undefined') {
				window.dispatchEvent(
					new CustomEvent('cursor:sync', {
						detail: message
					})
				);
			}
		})();
	}

	function updateRemoteCursor(clientId: string, cursor: CursorPosition): void {
		remoteCursors.update((cursors) => {
			cursors.set(clientId, {
				...cursor,
				isVisible: isRecentlySeen(cursor.lastUpdated)
			});
			return cursors;
		});
	}

	function removeRemoteCursor(clientId: string): void {
		remoteCursors.update((cursors) => {
			cursors.delete(clientId);
			return cursors;
		});
	}

	function isRecentlySeen(lastUpdated: number): boolean {
		return Date.now() - lastUpdated < 5000;
	}

	function pruneStale(): void {
		remoteCursors.update((cursors) => {
			const now = Date.now();
			const toDelete: string[] = [];

			cursors.forEach((cursor, clientId) => {
				if (now - cursor.lastUpdated > 30000) {
					toDelete.push(clientId);
				} else {
					cursor.isVisible = isRecentlySeen(cursor.lastUpdated);
				}
			});

			toDelete.forEach((id) => cursors.delete(id));
			return cursors;
		});
	}

	function clearRemoteCursors(): void {
		remoteCursors.set(new Map());
	}

	function getCursorColor(clientId: string): string {
		const colors = [
			'#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
			'#C7CEEA', '#FF8B94', '#A8D8EA', '#AA96DA'
		];

		let hash = 0;
		for (let i = 0; i < clientId.length; i++) {
			hash = ((hash << 5) - hash) + clientId.charCodeAt(i);
			hash = hash & hash;
		}

		return colors[Math.abs(hash) % colors.length];
	}

	return {
		localCursor: localCursor as Readable<Omit<CursorPosition, 'clientId' | 'userId' | 'color' | 'lastUpdated'> | null>,
		remoteCursors: remoteCursors as Readable<Map<string, RemoteCursor>>,
		updateLocalCursor,
		broadcastLocalCursor,
		updateRemoteCursor,
		removeRemoteCursor,
		clearRemoteCursors,
		pruneStale,
		getCursorColor
	};
}

export function createVisibleCursorsStore(
	remoteCursors: Readable<Map<string, RemoteCursor>>
): Readable<RemoteCursor[]> {
	return derived(remoteCursors, ($remoteCursors) => {
		return Array.from($remoteCursors.values()).filter((cursor) => cursor.isVisible);
	});
}

export function createCursorSyncListener(
	store: ReturnType<typeof createCursorSyncStore>,
	onCursorUpdate: (cursor: CursorPosition) => void
): () => void {
	const handleCursorEvent = (event: Event) => {
		const customEvent = event as CustomEvent<{ type: string; payload: CursorPosition }>;
		if (customEvent.detail?.type === 'cursor') {
			onCursorUpdate(customEvent.detail.payload);
		}
	};

	if (typeof window !== 'undefined') {
		window.addEventListener('cursor:sync', handleCursorEvent);
	}

	return () => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('cursor:sync', handleCursorEvent);
		}
	};
}

let globalCursorStore: ReturnType<typeof createCursorSyncStore> | null = null;

export function getGlobalCursorStore(): ReturnType<typeof createCursorSyncStore> {
	if (!globalCursorStore) {
		globalCursorStore = createCursorSyncStore();
	}
	return globalCursorStore;
}
