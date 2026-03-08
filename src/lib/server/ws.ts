/**
 * WebSocket server for real-time document collaboration
 * Handles connection management, presence tracking, and message broadcasting
 */

import type { IncomingMessage } from 'http';

export interface ClientConnection {
	id: string;
	userId: string;
	documentId: string;
	lastHeartbeat: number;
	send: (data: string) => void;
}

export interface CollaborationMessage {
	type: 'presence' | 'cursor' | 'edit' | 'conflict' | 'heartbeat';
	clientId: string;
	documentId: string;
	userId: string;
	payload?: Record<string, unknown>;
	timestamp: number;
}

export class WebSocketServer {
	private clients: Map<string, ClientConnection> = new Map();
	private documentSubscriptions: Map<string, Set<string>> = new Map(); // documentId -> clientIds
	private heartbeatInterval: NodeJS.Timeout | null = null;
	private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
	private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds

	constructor() {
		this.startHeartbeat();
	}

	/**
	 * Register a new client connection
	 */
	registerClient(
		clientId: string,
		userId: string,
		documentId: string,
		sendFn: (data: string) => void
	): ClientConnection {
		const client: ClientConnection = {
			id: clientId,
			userId,
			documentId,
			lastHeartbeat: Date.now(),
			send: sendFn
		};

		this.clients.set(clientId, client);

		// Add to document subscription
		if (!this.documentSubscriptions.has(documentId)) {
			this.documentSubscriptions.set(documentId, new Set());
		}
		this.documentSubscriptions.get(documentId)!.add(clientId);

		// Broadcast presence update
		this.broadcastToDocument(documentId, {
			type: 'presence',
			clientId,
			documentId,
			userId,
			payload: {
				action: 'join',
				userId,
				clientId
			},
			timestamp: Date.now()
		});

		return client;
	}

	/**
	 * Unregister a client connection
	 */
	unregisterClient(clientId: string): void {
		const client = this.clients.get(clientId);
		if (!client) return;

		this.clients.delete(clientId);

		// Remove from document subscription
		const subscribers = this.documentSubscriptions.get(client.documentId);
		if (subscribers) {
			subscribers.delete(clientId);
			if (subscribers.size === 0) {
				this.documentSubscriptions.delete(client.documentId);
			}
		}

		// Broadcast presence update
		this.broadcastToDocument(client.documentId, {
			type: 'presence',
			clientId,
			documentId: client.documentId,
			userId: client.userId,
			payload: {
				action: 'leave',
				userId: client.userId,
				clientId
			},
			timestamp: Date.now()
		});
	}

	/**
	 * Broadcast message to all clients in a document
	 */
	broadcastToDocument(documentId: string, message: CollaborationMessage): void {
		const subscribers = this.documentSubscriptions.get(documentId);
		if (!subscribers) return;

		const messageStr = JSON.stringify(message);
		subscribers.forEach((clientId) => {
			const client = this.clients.get(clientId);
			if (client) {
				try {
					client.send(messageStr);
				} catch (err) {
					console.error(`Failed to send message to client ${clientId}:`, err);
					this.unregisterClient(clientId);
				}
			}
		});
	}

	/**
	 * Handle incoming message from client
	 */
	handleMessage(clientId: string, rawMessage: string): void {
		const client = this.clients.get(clientId);
		if (!client) return;

		try {
			const message = JSON.parse(rawMessage) as CollaborationMessage;

			// Update heartbeat on any message
			client.lastHeartbeat = Date.now();

			// Process message based on type
			switch (message.type) {
				case 'cursor':
					this.broadcastToDocument(client.documentId, {
						...message,
						userId: client.userId,
						documentId: client.documentId,
						clientId,
						timestamp: Date.now()
					});
					break;

				case 'edit':
					this.broadcastToDocument(client.documentId, {
						...message,
						userId: client.userId,
						documentId: client.documentId,
						clientId,
						timestamp: Date.now()
					});
					break;

				case 'heartbeat':
					client.lastHeartbeat = Date.now();
					client.send(
						JSON.stringify({
							type: 'heartbeat',
							timestamp: Date.now()
						})
					);
					break;

				default:
					console.warn(`Unknown message type: ${message.type}`);
			}
		} catch (err) {
			console.error(`Failed to parse message from client ${clientId}:`, err);
		}
	}

	/**
	 * Start heartbeat timer to detect dead connections
	 */
	private startHeartbeat(): void {
		this.heartbeatInterval = setInterval(() => {
			const now = Date.now();
			const deadClients: string[] = [];

			this.clients.forEach((client, clientId) => {
				if (now - client.lastHeartbeat > this.HEARTBEAT_TIMEOUT) {
					deadClients.push(clientId);
				} else if (now - client.lastHeartbeat > this.HEARTBEAT_INTERVAL / 2) {
					// Send heartbeat ping
					try {
						client.send(
							JSON.stringify({
								type: 'heartbeat',
								timestamp: now
							})
						);
					} catch (err) {
						deadClients.push(clientId);
					}
				}
			});

			// Clean up dead clients
			deadClients.forEach((clientId) => this.unregisterClient(clientId));
		}, this.HEARTBEAT_INTERVAL);
	}

	/**
	 * Get list of online users for a document
	 */
	getDocumentPresence(documentId: string): Array<{ userId: string; clientId: string }> {
		const subscribers = this.documentSubscriptions.get(documentId);
		if (!subscribers) return [];

		const presence: Array<{ userId: string; clientId: string }> = [];
		subscribers.forEach((clientId) => {
			const client = this.clients.get(clientId);
			if (client) {
				presence.push({
					userId: client.userId,
					clientId
				});
			}
		});

		return presence;
	}

	/**
	 * Shutdown the server
	 */
	shutdown(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}
		this.clients.clear();
		this.documentSubscriptions.clear();
	}
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export function getWebSocketServer(): WebSocketServer {
	if (!wsServer) {
		wsServer = new WebSocketServer();
	}
	return wsServer;
}

export function initializeWebSocketServer(): WebSocketServer {
	wsServer = new WebSocketServer();
	return wsServer;
}
