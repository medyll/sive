import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketServer, type CollaborationMessage } from './ws';

/**
 * Integration tests for multi-client collaboration features
 * Tests WebSocket server, presence tracking, and message routing
 */

describe('Collaboration Integration', () => {
	let wsServer: WebSocketServer;
	let messageLog: Map<string, CollaborationMessage[]> = new Map();

	beforeEach(() => {
		wsServer = new WebSocketServer();
		messageLog.clear();
	});

	afterEach(() => {
		wsServer.shutdown();
	});

	function createMockClient(clientId: string) {
		if (!messageLog.has(clientId)) {
			messageLog.set(clientId, []);
		}

		return (data: string) => {
			try {
				const msg = JSON.parse(data) as CollaborationMessage;
				messageLog.get(clientId)!.push(msg);
			} catch (err) {
				console.error(`Failed to parse message for ${clientId}:`, err);
			}
		};
	}

	it('should handle multi-client join with presence broadcast', () => {
		// Client A joins doc1
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		const presenceAfterA = wsServer.getDocumentPresence('doc1');
		expect(presenceAfterA.length).toBe(1);

		// Client A receives own join event
		const c1JoinMessages = (messageLog.get('c1') || []).filter((m) => m.type === 'presence' && m.payload?.action === 'join');
		expect(c1JoinMessages.length).toBeGreaterThan(0);

		// Client B joins doc1
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));
		const presenceAfterB = wsServer.getDocumentPresence('doc1');

		// Both clients should be in presence
		expect(presenceAfterB.length).toBe(2);
		expect(presenceAfterB.some((p) => p.userId === 'alice')).toBe(true);
		expect(presenceAfterB.some((p) => p.userId === 'bob')).toBe(true);

		// Client B should receive join event (for self)
		const c2Messages = messageLog.get('c2') || [];
		const c2JoinEvent = c2Messages.find((m) => m.type === 'presence' && m.payload?.action === 'join');
		expect(c2JoinEvent).toBeDefined();
		expect(c2JoinEvent?.userId).toBe('bob');

		// Client A should also receive notification of B's join
		const c1Messages = messageLog.get('c1') || [];
		const c1BobJoinEvent = c1Messages.find(
			(m) => m.type === 'presence' && m.payload?.action === 'join' && m.userId === 'bob'
		);
		expect(c1BobJoinEvent).toBeDefined();
	});

	it('should broadcast cursor updates to all clients in document', () => {
		// Setup: Two clients in doc1
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));
		messageLog.get('c1')!.length = 0; // Clear join messages
		messageLog.get('c2')!.length = 0;

		// Alice sends cursor update
		const cursorMsg: CollaborationMessage = {
			type: 'cursor',
			clientId: 'c1',
			documentId: 'doc1',
			userId: 'alice',
			payload: { line: 10, column: 5 },
			timestamp: Date.now()
		};

		wsServer.handleMessage('c1', JSON.stringify(cursorMsg));

		// Both clients receive cursor update
		const c1Cursors = (messageLog.get('c1') || []).filter((m) => m.type === 'cursor');
		const c2Cursors = (messageLog.get('c2') || []).filter((m) => m.type === 'cursor');

		expect(c1Cursors.length).toBeGreaterThan(0);
		expect(c2Cursors.length).toBeGreaterThan(0);
		expect(c2Cursors[0].userId).toBe('alice');
	});

	it('should handle client disconnect and broadcast leave event', () => {
		// Setup: Two clients in doc1
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));
		messageLog.get('c2')!.length = 0; // Clear join message

		// Alice disconnects
		wsServer.unregisterClient('c1');

		// Bob should receive leave event
		const c2Messages = messageLog.get('c2') || [];
		const leaveEvent = c2Messages.find((m) => m.type === 'presence' && m.payload?.action === 'leave');
		expect(leaveEvent).toBeDefined();
		expect(leaveEvent?.userId).toBe('alice');

		// Presence should be updated
		const presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(1);
		expect(presence[0].userId).toBe('bob');
	});

	it('should maintain document isolation - messages only to subscribers', () => {
		// Setup: Two documents with different clients
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		wsServer.registerClient('c2', 'bob', 'doc2', createMockClient('c2'));

		messageLog.get('c1')!.length = 0;
		messageLog.get('c2')!.length = 0;

		// Alice sends edit to doc1
		const editMsg: CollaborationMessage = {
			type: 'edit',
			clientId: 'c1',
			documentId: 'doc1',
			userId: 'alice',
			payload: { text: 'hello', pos: 0 },
			timestamp: Date.now()
		};

		wsServer.handleMessage('c1', JSON.stringify(editMsg));

		// Only doc1 subscribers should receive it
		const c1Edits = (messageLog.get('c1') || []).filter((m) => m.type === 'edit');
		const c2Edits = (messageLog.get('c2') || []).filter((m) => m.type === 'edit');

		expect(c1Edits.length).toBeGreaterThan(0);
		expect(c2Edits.length).toBe(0);
	});

	it('should handle concurrent edits from multiple clients', () => {
		// Setup: Three clients, two documents
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));
		wsServer.registerClient('c3', 'charlie', 'doc1', createMockClient('c3'));

		messageLog.forEach((_, key) => {
			messageLog.get(key)!.length = 0;
		});

		// Concurrent edits at different positions
		const edits: CollaborationMessage[] = [
			{
				type: 'edit',
				clientId: 'c1',
				documentId: 'doc1',
				userId: 'alice',
				payload: { text: 'hello', pos: 0 },
				timestamp: Date.now()
			},
			{
				type: 'edit',
				clientId: 'c2',
				documentId: 'doc1',
				userId: 'bob',
				payload: { text: 'world', pos: 50 },
				timestamp: Date.now() + 1
			},
			{
				type: 'edit',
				clientId: 'c3',
				documentId: 'doc1',
				userId: 'charlie',
				payload: { text: '!', pos: 100 },
				timestamp: Date.now() + 2
			}
		];

		edits.forEach((edit) => {
			wsServer.handleMessage(edit.clientId, JSON.stringify(edit));
		});

		// All clients should receive all edits
		const c1Edits = (messageLog.get('c1') || []).filter((m) => m.type === 'edit');
		const c2Edits = (messageLog.get('c2') || []).filter((m) => m.type === 'edit');
		const c3Edits = (messageLog.get('c3') || []).filter((m) => m.type === 'edit');

		expect(c1Edits.length).toBe(3);
		expect(c2Edits.length).toBe(3);
		expect(c3Edits.length).toBe(3);

		// Verify message order is preserved
		expect(c1Edits[0].payload?.text).toBe('hello');
		expect(c1Edits[1].payload?.text).toBe('world');
		expect(c1Edits[2].payload?.text).toBe('!');
	});

	it('should handle presence updates with multiple concurrent actions', () => {
		// Client A joins
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));

		// Client B joins
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));

		// Client C joins
		wsServer.registerClient('c3', 'charlie', 'doc1', createMockClient('c3'));

		const presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(3);

		// Client B leaves
		wsServer.unregisterClient('c2');

		const presenceAfterLeave = wsServer.getDocumentPresence('doc1');
		expect(presenceAfterLeave.length).toBe(2);
		expect(presenceAfterLeave.every((p) => p.userId !== 'bob')).toBe(true);

		// Verify remaining clients got the leave notification
		const c1Messages = messageLog.get('c1') || [];
		const c3Messages = messageLog.get('c3') || [];
		const c1LeaveEvents = c1Messages.filter((m) => m.type === 'presence' && m.payload?.action === 'leave');
		const c3LeaveEvents = c3Messages.filter((m) => m.type === 'presence' && m.payload?.action === 'leave');

		expect(c1LeaveEvents.length).toBeGreaterThan(0);
		expect(c3LeaveEvents.length).toBeGreaterThan(0);
	});

	it('should preserve message timestamps for ordering', () => {
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));

		messageLog.forEach((_, key) => {
			messageLog.get(key)!.length = 0;
		});

		const now = Date.now();
		const messages: CollaborationMessage[] = [
			{
				type: 'edit',
				clientId: 'c1',
				documentId: 'doc1',
				userId: 'alice',
				payload: { text: 'a' },
				timestamp: now
			},
			{
				type: 'edit',
				clientId: 'c1',
				documentId: 'doc1',
				userId: 'alice',
				payload: { text: 'b' },
				timestamp: now + 10
			},
			{
				type: 'edit',
				clientId: 'c1',
				documentId: 'doc1',
				userId: 'alice',
				payload: { text: 'c' },
				timestamp: now + 20
			}
		];

		messages.forEach((msg) => {
			wsServer.handleMessage('c1', JSON.stringify(msg));
		});

		// Bob should receive all messages in order
		const c2Edits = (messageLog.get('c2') || []).filter((m) => m.type === 'edit');
		expect(c2Edits.length).toBe(3);
		expect(c2Edits[0].timestamp).toBeLessThanOrEqual(c2Edits[1].timestamp);
		expect(c2Edits[1].timestamp).toBeLessThanOrEqual(c2Edits[2].timestamp);
	});

	it('should handle empty document cleanup', () => {
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		wsServer.registerClient('c2', 'bob', 'doc2', createMockClient('c2'));

		// Initial state
		let presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(1);

		// All clients leave doc1
		wsServer.unregisterClient('c1');

		// Document should be cleaned up
		presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(0);

		// Doc2 should still exist
		const presence2 = wsServer.getDocumentPresence('doc2');
		expect(presence2.length).toBe(1);
	});

	it('should deliver presence info to newly connected clients', () => {
		// Alice connects to doc1
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		messageLog.get('c1')!.length = 0;

		// Alice sends a cursor update
		const cursorMsg: CollaborationMessage = {
			type: 'cursor',
			clientId: 'c1',
			documentId: 'doc1',
			userId: 'alice',
			payload: { line: 5 },
			timestamp: Date.now()
		};
		wsServer.handleMessage('c1', JSON.stringify(cursorMsg));

		// Bob connects after Alice's update
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));

		// Bob receives:
		// 1. His own join event
		// 2. Alice's current presence (implicitly from getDocumentPresence)
		const c2Messages = messageLog.get('c2') || [];
		const bobJoinEvent = c2Messages.find(
			(m) => m.type === 'presence' && m.payload?.action === 'join' && m.userId === 'bob'
		);
		expect(bobJoinEvent).toBeDefined();

		// Verify Alice is in the presence list
		const presence = wsServer.getDocumentPresence('doc1');
		expect(presence.some((p) => p.userId === 'alice')).toBe(true);

		// Alice should receive notification of Bob joining
		const c1Messages = messageLog.get('c1') || [];
		const aliceSeeBobJoin = c1Messages.find(
			(m) => m.type === 'presence' && m.payload?.action === 'join' && m.userId === 'bob'
		);
		expect(aliceSeeBobJoin).toBeDefined();
	});

	it('should handle rapid client connections and disconnections', () => {
		const clients = Array.from({ length: 10 }, (_, i) => ({
			id: `c${i}`,
			userId: `user${i}`,
			docId: 'doc1'
		}));

		// Rapidly connect all clients
		clients.forEach((client) => {
			wsServer.registerClient(client.id, client.userId, client.docId, createMockClient(client.id));
		});

		let presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(10);

		// Rapidly disconnect all clients
		clients.forEach((client) => {
			wsServer.unregisterClient(client.id);
		});

		presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(0);
	});

	it('should handle mixed message types in sequence', () => {
		wsServer.registerClient('c1', 'alice', 'doc1', createMockClient('c1'));
		wsServer.registerClient('c2', 'bob', 'doc1', createMockClient('c2'));

		messageLog.forEach((_, key) => {
			messageLog.get(key)!.length = 0;
		});

		// Mix of message types
		const mixedSequence = [
			{ type: 'cursor' as const, payload: { line: 1, column: 0 } },
			{ type: 'edit' as const, payload: { text: 'a', pos: 0 } },
			{ type: 'cursor' as const, payload: { line: 1, column: 1 } },
			{ type: 'edit' as const, payload: { text: 'b', pos: 1 } },
			{ type: 'cursor' as const, payload: { line: 1, column: 2 } }
		];

		mixedSequence.forEach((item) => {
			const msg: CollaborationMessage = {
				type: item.type,
				clientId: 'c1',
				documentId: 'doc1',
				userId: 'alice',
				payload: item.payload,
				timestamp: Date.now()
			};
			wsServer.handleMessage('c1', JSON.stringify(msg));
		});

		// Bob should receive all messages
		const c2Messages = messageLog.get('c2') || [];
		const c2Cursors = c2Messages.filter((m) => m.type === 'cursor');
		const c2Edits = c2Messages.filter((m) => m.type === 'edit');

		expect(c2Cursors.length).toBe(3);
		expect(c2Edits.length).toBe(2);
	});
});
