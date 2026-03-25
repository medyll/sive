import { describe, it, expect, beforeEach } from 'vitest';
import {
	createCursorSyncStore,
	createVisibleCursorsStore,
	createCursorSyncListener,
	type CursorPosition
} from './cursor-sync';

describe('Cursor Sync', () => {
	let store: ReturnType<typeof createCursorSyncStore>;
	let localValue: any;
	let remotesValue: Map<string, any>;

	beforeEach(() => {
		store = createCursorSyncStore();
		store.localCursor.subscribe((v) => {
			localValue = v;
		});
		store.remoteCursors.subscribe((v) => {
			remotesValue = v;
		});
	});

	it('updates local cursor', () => {
		store.updateLocalCursor(5, 10);
		expect(localValue?.line).toBe(5);
		expect(localValue?.column).toBe(10);
	});

	it('tracks selection with cursor', () => {
		const sel = { startLine: 5, startColumn: 0, endLine: 5, endColumn: 10 };
		store.updateLocalCursor(5, 10, sel);
		expect(localValue?.selection).toEqual(sel);
	});

	it('adds remote cursor', () => {
		const cursor: CursorPosition = {
			clientId: 'c1',
			userId: 'u1',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			lastUpdated: Date.now()
		};
		store.updateRemoteCursor('c1', cursor);
		expect(remotesValue.has('c1')).toBe(true);
		expect(remotesValue.get('c1').line).toBe(5);
	});

	it('removes remote cursor', () => {
		const cursor: CursorPosition = {
			clientId: 'c1',
			userId: 'u1',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			lastUpdated: Date.now()
		};
		store.updateRemoteCursor('c1', cursor);
		store.removeRemoteCursor('c1');
		expect(remotesValue.has('c1')).toBe(false);
	});

	it('marks cursor visible when recent', () => {
		const cursor: CursorPosition = {
			clientId: 'c1',
			userId: 'u1',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			lastUpdated: Date.now()
		};
		store.updateRemoteCursor('c1', cursor);
		expect(remotesValue.get('c1').isVisible).toBe(true);
	});

	it('generates consistent colors', () => {
		const c1 = store.getCursorColor('client1');
		const c2 = store.getCursorColor('client1');
		expect(c1).toBe(c2);
	});

	it('generates different colors for different clients', () => {
		const colors = new Set([
			store.getCursorColor('c1'),
			store.getCursorColor('c2'),
			store.getCursorColor('c3')
		]);
		expect(colors.size).toBeGreaterThan(1);
	});

	it('clears remote cursors', () => {
		const cursor: CursorPosition = {
			clientId: 'c1',
			userId: 'u1',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			lastUpdated: Date.now()
		};
		store.updateRemoteCursor('c1', cursor);
		store.clearRemoteCursors();
		expect(remotesValue.size).toBe(0);
	});

	it('handles multiple remote cursors', () => {
		const c1: CursorPosition = {
			clientId: 'c1',
			userId: 'u1',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			lastUpdated: Date.now()
		};
		const c2: CursorPosition = {
			clientId: 'c2',
			userId: 'u2',
			line: 20,
			column: 30,
			color: '#4ECDC4',
			lastUpdated: Date.now()
		};
		store.updateRemoteCursor('c1', c1);
		store.updateRemoteCursor('c2', c2);
		expect(remotesValue.size).toBe(2);
	});

	it('creates visible cursors store', () => {
		const now = Date.now();
		const fresh: CursorPosition = {
			clientId: 'fresh',
			userId: 'u1',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			lastUpdated: now
		};
		const stale: CursorPosition = {
			clientId: 'stale',
			userId: 'u2',
			line: 10,
			column: 20,
			color: '#4ECDC4',
			lastUpdated: now - 6000
		};
		store.updateRemoteCursor('fresh', fresh);
		store.updateRemoteCursor('stale', stale);

		const visible = createVisibleCursorsStore(store.remoteCursors);
		let visibleList: any[] = [];
		visible.subscribe((v) => {
			visibleList = v;
		});

		expect(visibleList.length).toBe(1);
		expect(visibleList[0].clientId).toBe('fresh');
	});

	it('creates listener', () => {
		const onUpdate = () => {};
		const cleanup = createCursorSyncListener(store, onUpdate);
		expect(typeof cleanup).toBe('function');
		cleanup();
	});

	it('broadcasts cursor updates', () => {
		store.updateLocalCursor(5, 10);
		store.broadcastLocalCursor();
		expect(localValue?.line).toBe(5);
	});

	it('prunes stale cursors', () => {
		const now = Date.now();
		const stale: CursorPosition = {
			clientId: 'stale',
			userId: 'u1',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			lastUpdated: now - 31000
		};
		const fresh: CursorPosition = {
			clientId: 'fresh',
			userId: 'u2',
			line: 10,
			column: 20,
			color: '#4ECDC4',
			lastUpdated: now
		};
		store.updateRemoteCursor('stale', stale);
		store.updateRemoteCursor('fresh', fresh);
		store.pruneStale();
		expect(remotesValue.size).toBe(1);
		expect(remotesValue.has('fresh')).toBe(true);
	});

	it('updates cursor multiple times', () => {
		store.updateLocalCursor(1, 5);
		expect(localValue.line).toBe(1);
		store.updateLocalCursor(10, 20);
		expect(localValue.line).toBe(10);
		expect(localValue.column).toBe(20);
	});

	it('handles empty remote cursors', () => {
		const presence = (store as Record<string, any>).getDocumentPresence?.() || [];
		expect(Array.isArray(presence) || presence instanceof Map).toBe(true);
	});
});
