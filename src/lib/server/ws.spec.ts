import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocketServer, type CollaborationMessage } from './ws';

describe('WebSocketServer', () => {
	let wsServer: WebSocketServer;
	let messages: { clientId: string; data: string }[] = [];

	beforeEach(() => {
		wsServer = new WebSocketServer();
		messages = [];
	});

	afterEach(() => {
		wsServer.shutdown();
	});

	function createMockSendFn(clientId: string) {
		return (data: string) => {
			messages.push({ clientId, data });
		};
	}

	it('registers client and broadcasts presence', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		expect(messages.length).toBeGreaterThan(0);
		const msg = JSON.parse(messages[0].data) as CollaborationMessage;
		expect(msg.type).toBe('presence');
		expect(msg.payload?.action).toBe('join');
	});

	it('unregisters client and broadcasts leave', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		wsServer.registerClient('c2', 'user2', 'doc1', createMockSendFn('c2'));
		messages = [];
		wsServer.unregisterClient('c1');
		expect(messages.length).toBeGreaterThan(0);
		const msg = JSON.parse(messages[0].data) as CollaborationMessage;
		expect(msg.type).toBe('presence');
		expect(msg.payload?.action).toBe('leave');
	});

	it('broadcasts to document subscribers', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		wsServer.registerClient('c2', 'user2', 'doc1', createMockSendFn('c2'));
		messages = [];

		const msg: CollaborationMessage = {
			type: 'cursor',
			clientId: 'c1',
			documentId: 'doc1',
			userId: 'user1',
			payload: { line: 10 },
			timestamp: Date.now()
		};

		wsServer.broadcastToDocument('doc1', msg);
		expect(messages.length).toBeGreaterThanOrEqual(2);
	});

	it('returns document presence', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		wsServer.registerClient('c2', 'user2', 'doc1', createMockSendFn('c2'));

		const presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(2);
		expect(presence.some((p) => p.userId === 'user1')).toBe(true);
		expect(presence.some((p) => p.userId === 'user2')).toBe(true);
	});

	it('handles messages from clients', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		messages = [];

		const msg: CollaborationMessage = {
			type: 'cursor',
			clientId: 'c1',
			documentId: 'doc1',
			userId: 'user1',
			payload: { line: 5 },
			timestamp: Date.now()
		};

		wsServer.handleMessage('c1', JSON.stringify(msg));
		expect(messages.length).toBeGreaterThan(0);
	});

	it('manages multiple documents', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		wsServer.registerClient('c2', 'user2', 'doc2', createMockSendFn('c2'));

		const presence1 = wsServer.getDocumentPresence('doc1');
		const presence2 = wsServer.getDocumentPresence('doc2');

		expect(presence1.length).toBe(1);
		expect(presence2.length).toBe(1);
	});

	it('clears on shutdown', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		wsServer.shutdown();

		const presence = wsServer.getDocumentPresence('doc1');
		expect(presence.length).toBe(0);
	});

	it('responds to heartbeat', async () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		messages = [];

		wsServer.handleMessage('c1', JSON.stringify({ type: 'heartbeat' }));
		await new Promise((r) => setTimeout(r, 10));

		const heartbeat = messages.find((m) => JSON.parse(m.data).type === 'heartbeat');
		expect(heartbeat).toBeDefined();
	});

	it('broadcasts edits', () => {
		wsServer.registerClient('c1', 'user1', 'doc1', createMockSendFn('c1'));
		wsServer.registerClient('c2', 'user2', 'doc1', createMockSendFn('c2'));
		messages = [];

		const msg: CollaborationMessage = {
			type: 'edit',
			clientId: 'c1',
			documentId: 'doc1',
			userId: 'user1',
			payload: { text: 'hello', pos: 0 },
			timestamp: Date.now()
		};

		wsServer.broadcastToDocument('doc1', msg);
		const edits = messages.filter((m) => JSON.parse(m.data).type === 'edit');
		expect(edits.length).toBeGreaterThan(0);
	});
});
