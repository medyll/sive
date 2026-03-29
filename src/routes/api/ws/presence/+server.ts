/**
 * WebSocket Server for Real-time Collaboration
 * 
 * Handles presence, cursors, and collaborative editing events.
 * Built on SvelteKit server-side WebSocket support.
 */

import type { RequestHandler } from './$types';

interface Client {
	userId: string;
	docId: string;
	ws: WebSocket;
	name?: string;
	color?: string;
	lastActivity: number;
}

interface PresenceMessage {
	type: 'presence' | 'cursor' | 'activity' | 'heartbeat' | 'subscribe' | 'unsubscribe';
	docId: string;
	userId: string;
	data?: unknown;
	timestamp: number;
}

// Connected clients
const clients: Map<string, Client> = new Map();

// Document presence tracking
const docPresence: Map<string, Set<string>> = new Map();

export const GET: RequestHandler = async ({ request }) => {
	const { 0: response } = new WebSocketPair();
	const ws = response;

	ws.accept();

	let clientInfo: Client | null = null;

	ws.addEventListener('message', async (event) => {
		try {
			const message = JSON.parse(event.data as string) as PresenceMessage;
			
			switch (message.type) {
				case 'subscribe': {
					// Client subscribes to a document
					const docId = message.docId;
					const userId = message.userId;
					
					// Create or update client
					clientInfo = {
						userId,
						docId,
						ws,
						lastActivity: Date.now()
					};
					clients.set(userId, clientInfo);
					
					// Add to document presence
					if (!docPresence.has(docId)) {
						docPresence.set(docId, new Set());
					}
					docPresence.get(docId)?.add(userId);
					
					// Broadcast presence update to all users in doc
					broadcastPresence(docId);
					break;
				}
				
				case 'unsubscribe': {
					if (clientInfo) {
						const docId = clientInfo.docId;
						docPresence.get(docId)?.delete(clientInfo.userId);
						clients.delete(clientInfo.userId);
						broadcastPresence(docId);
					}
					break;
				}
				
				case 'cursor': {
					// Broadcast cursor position to other users in same doc
					if (clientInfo) {
						broadcastToDoc(clientInfo.docId, message, clientInfo.userId);
					}
					break;
				}
				
				case 'heartbeat': {
					if (clientInfo) {
						clientInfo.lastActivity = Date.now();
					}
					break;
				}
				
				case 'presence': {
					// Update user presence info
					if (clientInfo && message.data) {
						const data = message.data as { name?: string; status?: string; color?: string };
						if (data.name) clientInfo.name = data.name;
						if (data.color) clientInfo.color = data.color;
						broadcastPresence(clientInfo.docId);
					}
					break;
				}
			}
		} catch (err) {
			console.error('[WS] Message error:', err);
		}
	});

	ws.addEventListener('close', () => {
		if (clientInfo) {
			const docId = clientInfo.docId;
			docPresence.get(docId)?.delete(clientInfo.userId);
			clients.delete(clientInfo.userId);
			broadcastPresence(docId);
		}
	});

	return new Response(null, {
		status: 101,
		webSocket: response
	});
};

/**
 * Broadcast presence update to all users in a document
 */
function broadcastPresence(docId: string): void {
	const userIds = docPresence.get(docId) || new Set();
	const users = Array.from(userIds).map((id) => {
		const client = clients.get(id);
		return {
			userId: id,
			name: client?.name,
			color: client?.color,
			lastActivity: client?.lastActivity || Date.now()
		};
	});

	const message: PresenceMessage = {
		type: 'presence',
		docId,
		userId: 'server',
		data: { users },
		timestamp: Date.now()
	};

	broadcastToDoc(docId, message);
}

/**
 * Broadcast message to all users in a document
 */
function broadcastToDoc(docId: string, message: PresenceMessage, excludeUserId?: string): void {
	const userIds = docPresence.get(docId) || new Set();
	
	userIds.forEach((userId) => {
		if (userId === excludeUserId) return;
		
		const client = clients.get(userId);
		if (client?.ws.readyState === WebSocket.OPEN) {
			client.ws.send(JSON.stringify(message));
		}
	});
}

/**
 * Cleanup inactive clients (called periodically)
 */
export function cleanupInactiveClients(): void {
	const now = Date.now();
	const timeout = 120000; // 2 minutes
	
	for (const [userId, client] of clients.entries()) {
		if (now - client.lastActivity > timeout) {
			docPresence.get(client.docId)?.delete(userId);
			clients.delete(userId);
			broadcastPresence(client.docId);
			console.log(`[WS] Cleaned up inactive client: ${userId}`);
		}
	}
}

// Run cleanup every minute
setInterval(cleanupInactiveClients, 60000);
