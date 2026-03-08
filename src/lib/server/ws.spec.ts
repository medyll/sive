import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

	describe('Client Registration', () => {
		it('registers a new client connection', () => {
			const client = wsServer.registerClient(
				'client-1',
				'user-1',
				'doc-1',
				createMockSendFn('client-1')
			);

			expect(client.id).toBe('client-1');
			expect(client.userId).toBe('user-1');
			expect(client.documentId).toBe('doc-1');
		});

		it('broadcasts presence update on client join', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));

			expect(messages).toHaveLength(1);
			const msg = JSON.parse(messages[0].data) as CollaborationMessage;
			expect(msg.type).toBe('presence');
			expect(msg.payload?.action).toBe('join');
		});

		it('registers multiple clients for same document', () => {
			messages = [];
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			messages = [];

			wsServer.registerClient('client-2', 'user-2', 'doc-1', createMockSendFn('client-2'));

			// Client 2 should receive the presence update
			expect(messages.some((m) => m.clientId === 'client-2')).toBe(true);
		});
	});

	describe('Client Unregistration', () => {
		it('unregisters a client connection', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			messages = [];

			wsServer.unregisterClient('client-1');

			expect(messages).toHaveLength(0); // No message should be sent for cleanup
		});

		it('broadcasts presence update on client leave', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			wsServer.registerClient('client-2', 'user-2', 'doc-1', createMockSendFn('client-2'));
			messages = [];

			wsServer.unregisterClient('client-1');

			const leaveMessages = messages.filter(
				(m) => JSON.parse(m.data).payload?.action === 'leave'
			);
			expect(leaveMessages.length).toBeGreaterThan(0);
		});
	});

	describe('Message Broadcasting', () => {
		it('broadcasts cursor message to all document subscribers', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			wsServer.registerClient('client-2', 'user-2', 'doc-1', createMockSendFn('client-2'));
			messages = [];

			const cursorMsg: CollaborationMessage = {
				type: 'cursor',
				clientId: 'client-1',
				documentId: 'doc-1',
				userId: 'user-1',
				payload: { line: 10, column: 5 },
				timestamp: Date.now()
			};

			wsServer.broadcastToDocument('doc-1', cursorMsg);

			// Should be broadcast to both clients
			expect(messages.length).toBeGreaterThanOrEqual(2);
		});

		it('handles edit messages', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			wsServer.registerClient('client-2', 'user-2', 'doc-1', createMockSendFn('client-2'));
			messages = [];

			const editMsg: CollaborationMessage = {
				type: 'edit',
				clientId: 'client-1',
				documentId: 'doc-1',
				userId: 'user-1',
				payload: { text: 'hello', position: 0 },
				timestamp: Date.now()
			};

			wsServer.handleMessage('client-1', JSON.stringify(editMsg));

			const broadcastedEdits = messages.filter((m) => JSON.parse(m.data).type === 'edit');
			expect(broadcastedEdits.length).toBeGreaterThan(0);
		});
	});

	describe('Presence Tracking', () => {
		it('returns empty presence for non-existent document', () => {
			const presence = wsServer.getDocumentPresence('non-existent');
			expect(presence).toEqual([]);
		});

		it('returns presence for active document', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			wsServer.registerClient('client-2', 'user-2', 'doc-1', createMockSendFn('client-2'));

			const presence = wsServer.getDocumentPresence('doc-1');

			expect(presence).toHaveLength(2);
			expect(presence.some((p) => p.userId === 'user-1')).toBe(true);
			expect(presence.some((p) => p.userId === 'user-2')).toBe(true);
		});

		it('updates presence when client leaves', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			wsServer.registerClient('client-2', 'user-2', 'doc-1', createMockSendFn('client-2'));

			wsServer.unregisterClient('client-1');

			const presence = wsServer.getDocumentPresence('doc-1');
			expect(presence).toHaveLength(1);
			expect(presence[0].userId).toBe('user-2');
		});
	});

	describe('Heartbeat', () => {
		it('responds to heartbeat messages', async () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			messages = [];

			const heartbeatMsg = {
				type: 'heartbeat'
			};

			wsServer.handleMessage('client-1', JSON.stringify(heartbeatMsg));

			await new Promise((resolve) => setTimeout(resolve, 10));
			const heartbeatResponse = messages.find((m) => JSON.parse(m.data).type === 'heartbeat');
			expect(heartbeatResponse).toBeDefined();
		});
	});

	describe('Server Shutdown', () => {
		it('clears all clients on shutdown', () => {
			wsServer.registerClient('client-1', 'user-1', 'doc-1', createMockSendFn('client-1'));
			wsServer.registerClient('client-2', 'user-2', 'doc-2', createMockSendFn('client-2'));

			wsServer.shutdown();

			const presence1 = wsServer.getDocumentPresence('doc-1');
			const presence2 = wsServer.getDocumentPresence('doc-2');

			expect(presence1).toEqual([]);
			expect(presence2).toEqual([]);
		});
	});
});
