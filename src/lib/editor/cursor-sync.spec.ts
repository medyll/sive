import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	createCursorSyncStore,
	createVisibleCursorsStore,
	createCursorSyncListener,
	type CursorPosition
} from './cursor-sync';

describe('Cursor Sync Store', () => {
	let store: ReturnType<typeof createCursorSyncStore>;
	let localCursorValue: any;
	let remoteCursorsValue: Map<string, any>;

	beforeEach(() => {
		store = createCursorSyncStore();

		// Subscribe to stores
		store.localCursor.subscribe((value) => {
			localCursorValue = value;
		});

		store.remoteCursors.subscribe((value) => {
			remoteCursorsValue = value;
		});
	});

	describe('Local Cursor', () => {
		it('updates local cursor position', () => {
			store.updateLocalCursor(5, 10);

			expect(localCursorValue).not.toBeNull();
			expect(localCursorValue.line).toBe(5);
			expect(localCursorValue.column).toBe(10);
		});

		it('tracks cursor with selection', () => {
			const selection = {
				startLine: 5,
				startColumn: 0,
				endLine: 5,
				endColumn: 10
			};

			store.updateLocalCursor(5, 10, selection);

			expect(localCursorValue.selection).toEqual(selection);
		});

		it('updates cursor on multiple changes', () => {
			store.updateLocalCursor(1, 5);
			expect(localCursorValue.line).toBe(1);

			store.updateLocalCursor(10, 20);
			expect(localCursorValue.line).toBe(10);
			expect(localCursorValue.column).toBe(20);
		});
	});

	describe('Remote Cursors', () => {
		it('adds remote cursor', () => {
			const cursor: CursorPosition = {
				clientId: 'client1',
				userId: 'user1',
				line: 5,
				column: 10,
				color: '#FF6B6B',
				lastUpdated: Date.now()
			};

			store.updateRemoteCursor('client1', cursor);

			expect(remoteCursorsValue.has('client1')).toBe(true);
			expect(remoteCursorsValue.get('client1').line).toBe(5);
		});

		it('marks cursor as visible when recently updated', () => {
			const cursor: CursorPosition = {
				clientId: 'client1',
				userId: 'user1',
				line: 5,
				column: 10,
				color: '#FF6B6B',
				lastUpdated: Date.now()
			};

			store.updateRemoteCursor('client1', cursor);

			expect(remoteCursorsValue.get('client1').isVisible).toBe(true);
		});

		it('removes remote cursor', () => {
			const cursor: CursorPosition = {
				clientId: 'client1',
				userId: 'user1',
				line: 5,
				column: 10,
				color: '#FF6B6B',
				lastUpdated: Date.now()
			};

			store.updateRemoteCursor('client1', cursor);
			expect(remoteCursorsValue.has('client1')).toBe(true);

			store.removeRemoteCursor('client1');
			expect(remoteCursorsValue.has('client1')).toBe(false);
		});

		it('handles multiple remote cursors', () => {
			const cursor1: CursorPosition = {
				clientId: 'client1',
				userId: 'user1',
				line: 5,
				column: 10,
				color: '#FF6B6B',
				lastUpdated: Date.now()
			};

			const cursor2: CursorPosition = {
				clientId: 'client2',
				userId: 'user2',
				line: 20,
				column: 30,
				color: '#4ECDC4',
				lastUpdated: Date.now()
			};

			store.updateRemoteCursor('client1', cursor1);
			store.updateRemoteCursor('client2', cursor2);

			expect(remoteCursorsValue.size).toBe(2);
			expect(remoteCursorsValue.has('client1')).toBe(true);
			expect(remoteCursorsValue.has('client2')).toBe(true);
		});
	});

	describe('Cursor Colors', () => {
		it('generates consistent color for same clientId', () => {
			const color1 = store.getCursorColor('client1');
			const color2 = store.getCursorColor('client1');

			expect(color1).toBe(color2);
		});

		it('generates different colors for different clientIds', () => {
			const color1 = store.getCursorColor('client1');
			const color2 = store.getCursorColor('client2');
			const color3 = store.getCursorColor('client3');

			// At least some should be different (though collision possible due to hash)
			const colors = new Set([color1, color2, color3]);
			expect(colors.size).toBeGreaterThan(1);
		});

		it('returns valid color codes', () => {
			const color = store.getCursorColor('test-client');
			expect(color).toMatch(/^#[0-9A-F]{6}$/i);
		});
	});

	describe('Cursor Pruning', () => {
		it('clears remote cursors', () => {
			const cursor: CursorPosition = {
				clientId: 'client1',
				userId: 'user1',
				line: 5,
				column: 10,
				color: '#FF6B6B',
				lastUpdated: Date.now()
			};

			store.updateRemoteCursor('client1', cursor);
			expect(remoteCursorsValue.size).toBe(1);

			store.clearRemoteCursors();
			expect(remoteCursorsValue.size).toBe(0);
		});

		it('prunes stale cursors (older than 30s)', () => {
			const now = Date.now();
			const staleTime = now - 31000; // 31 seconds ago

			const staleCursor: CursorPosition = {
				clientId: 'stale',
				userId: 'user-stale',
				line: 5,
				column: 10,
				color: '#FF6B6B',
				lastUpdated: staleTime
			};

			const freshCursor: CursorPosition = {
				clientId: 'fresh',
				userId: 'user-fresh',
				line: 10,
				column: 20,
				color: '#4ECDC4',
				lastUpdated: now
			};

			store.updateRemoteCursor('stale', staleCursor);
			store.updateRemoteCursor('fresh', freshCursor);

			expect(remoteCursorsValue.size).toBe(2);

			store.pruneStale();

			expect(remoteCursorsValue.size).toBe(1);
			expect(remoteCursorsValue.has('fresh')).toBe(true);
			expect(remoteCursorsValue.has('stale')).toBe(false);
		});
	});

	describe('Visible Cursors Derived Store', () => {
		it('filters to only visible cursors', () => {
			const now = Date.now();

			// Fresh cursor (visible)
			const freshCursor: CursorPosition = {
				clientId: 'fresh',
				userId: 'user-fresh',
				line: 5,
				column: 10,
				color: '#FF6B6B',
				lastUpdated: now
			};

			// Stale cursor (not visible)
			const staleCursor: CursorPosition = {
				clientId: 'stale',
				userId: 'user-stale',
				line: 10,
				column: 20,
				color: '#4ECDC4',
				lastUpdated: now - 6000 // 6 seconds ago
			};

			store.updateRemoteCursor('fresh', freshCursor);
			store.updateRemoteCursor('stale', staleCursor);

			const visibleStore = createVisibleCursorsStore(store.remoteCursors);
			let visibleCursors: any[] = [];

			visibleStore.subscribe((value) => {
				visibleCursors = value;
			});

			expect(visibleCursors.length).toBe(1);
			expect(visibleCursors[0].clientId).toBe('fresh');
		});
	});

	describe('Cursor Sync Listener', () => {
		it('creates listener and returns cleanup function', () => {
			const onCursorUpdate = vi.fn();
			const cleanup = createCursorSyncListener(store, onCursorUpdate);

			// Verify cleanup function exists
			expect(typeof cleanup).toBe('function');

			// Call cleanup to ensure no errors
			cleanup();
		});

		it('broadcasts cursor updates', () => {
			store.updateLocalCursor(5, 10);

			expect(localCursorValue).not.toBeNull();
			expect(localCursorValue.line).toBe(5);

			// Call broadcast (this would send to WebSocket in real implementation)
			store.broadcastLocalCursor();

			// No errors should occur
		});
	});
});
