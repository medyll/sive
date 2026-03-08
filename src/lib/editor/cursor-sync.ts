/**
 * Real-time cursor synchronization for collaborative editing
 * Tracks and broadcasts cursor positions from all connected users
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

/**
 * Cursor sync store for managing local and remote cursor positions
 */
export function createCursorSyncStore() {
	// Local cursor position
	const localCursor = writable<Omit<CursorPosition, 'clientId' | 'userId' | 'color' | 'lastUpdated'> | null>(null);

	// Remote cursors map (clientId -> CursorPosition)
	const remoteCursors = writable<Map<string, RemoteCursor>>(new Map());

	// Debounce timer for cursor updates
	let debounceTimer: NodeJS.Timeout | null = null;
	const DEBOUNCE_INTERVAL = 100; // 100ms debounce

	/**
	 * Update local cursor position with debouncing
	 */
	function updateLocalCursor(
		line: number,
		column: number,
		selection?: CursorPosition['selection']
	): void {
		localCursor.set({
			line,
			column,
			selection
		});

		// Debounce broadcast
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			broadcastLocalCursor();
		}, DEBOUNCE_INTERVAL);
	}

	/**
	 * Broadcast local cursor to server
	 */
	function broadcastLocalCursor(): void {
		localCursor.subscribe((cursor) => {
			if (!cursor) return;

			const message = {
				type: 'cursor',
				payload: cursor
			};

			// In a real implementation, this would send via WebSocket
			// For now, dispatch as custom event (only in browser)
			if (typeof window !== 'undefined') {
				window.dispatchEvent(
					new CustomEvent('cursor:sync', {
						detail: message
					})
				);
			}
		})();
	}

	/**
	 * Update a remote cursor position
	 */
	function updateRemoteCursor(clientId: string, cursor: CursorPosition): void {
		remoteCursors.update((cursors) => {
			const existing = cursors.get(clientId) || {
				...cursor,
				isVisible: true
			};

			cursors.set(clientId, {
				...cursor,
				isVisible: isRecentlySeen(cursor.lastUpdated)
			});

			return cursors;
		});
	}

	/**
	 * Remove a remote cursor (user disconnected)
	 */
	function removeRemoteCursor(clientId: string): void {
		remoteCursors.update((cursors) => {
			cursors.delete(clientId);
			return cursors;
		});
	}

	/**
	 * Check if cursor is recently seen (within 5 seconds)
	 */
	function isRecentlySeen(lastUpdated: number): boolean {
		return Date.now() - lastUpdated < 5000;
	}

	/**
	 * Prune stale cursors
	 */
	function pruneStale(): void {
		remoteCursors.update((cursors) => {
			const now = Date.now();
			const toDelete: string[] = [];

			cursors.forEach((cursor, clientId) => {
				if (now - cursor.lastUpdated > 30000) {
					// Remove cursors older than 30 seconds
					toDelete.push(clientId);
				} else {
					// Update visibility
					cursor.isVisible = isRecentlySeen(cursor.lastUpdated);
				}
			});

			toDelete.forEach((id) => cursors.delete(id));
			return cursors;
		});
	}

	/**
	 * Clear all remote cursors
	 */
	function clearRemoteCursors(): void {
		remoteCursors.set(new Map());
	}

	/**
	 * Get cursor color for a client (deterministic hash-based)
	 */
	function getCursorColor(clientId: string): string {
		const colors = [
			'#FF6B6B', // Red
			'#4ECDC4', // Teal
			'#FFE66D', // Yellow
			'#95E1D3', // Mint
			'#C7CEEA', // Lavender
			'#FF8B94', // Pink
			'#A8D8EA', // Light Blue
			'#AA96DA' // Purple
		];

		// Hash clientId to determine color
		let hash = 0;
		for (let i = 0; i < clientId.length; i++) {
			hash = ((hash << 5) - hash) + clientId.charCodeAt(i);
			hash = hash & hash; // Convert to 32-bit integer
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

/**
 * Create a derived store for all visible remote cursors
 */
export function createVisibleCursorsStore(
	remoteCursors: Readable<Map<string, RemoteCursor>>
): Readable<RemoteCursor[]> {
	return derived(remoteCursors, ($remoteCursors) => {
		return Array.from($remoteCursors.values()).filter((cursor) => cursor.isVisible);
	});
}

/**
 * Listener for cursor sync events from other clients
 */
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

	// Only add listener in browser environment
	if (typeof window !== 'undefined') {
		window.addEventListener('cursor:sync', handleCursorEvent);
	}

	// Return cleanup function
	return () => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('cursor:sync', handleCursorEvent);
		}
	};
}

// Global cursor sync store instance
let globalCursorStore: ReturnType<typeof createCursorSyncStore> | null = null;

export function getGlobalCursorStore(): ReturnType<typeof createCursorSyncStore> {
	if (!globalCursorStore) {
		globalCursorStore = createCursorSyncStore();
	}
	return globalCursorStore;
}
