/**
 * WebSocket Presence Client
 * 
 * Manages real-time presence connections via WebSocket.
 * Handles cursor positions, activity status, and user presence synchronization.
 */

import type { CursorPosition, ActiveUser } from './presenceStore.svelte';

export interface PresenceMessage {
	type: 'presence' | 'cursor' | 'activity' | 'heartbeat';
	docId: string;
	userId: string;
	data?: unknown;
	timestamp: number;
}

export interface CursorMessage extends PresenceMessage {
	type: 'cursor';
	data: {
		offset: number;
		selection?: { start: number; end: number } | null;
	};
}

export interface PresenceUpdateMessage extends PresenceMessage {
	type: 'presence';
	data: {
		name?: string;
		status: 'active' | 'idle' | 'offline';
		color?: string;
	};
}

/**
 * WebSocket Presence Client class
 */
export class WebSocketPresenceClient {
	private ws: WebSocket | null = null;
	private userId: string;
	private docId: string | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
	private messageQueue: PresenceMessage[] = [];
	
	// Callbacks
	onPresenceUpdate: ((users: ActiveUser[]) => void) | null = null;
	onCursorUpdate: ((userId: string, cursor: CursorPosition) => void) | null = null;
	onConnectionChange: ((connected: boolean) => void) | null = null;

	constructor(userId: string, wsUrl: string = 'ws://localhost:3000') {
		this.userId = userId;
		this.connect(wsUrl);
	}

	/**
	 * Connect to WebSocket server
	 */
	private connect(wsUrl: string): void {
		try {
			this.ws = new WebSocket(wsUrl);

			this.ws.onopen = () => {
				console.log('[Presence WS] Connected');
				this.reconnectAttempts = 0;
				this.startHeartbeat();
				this.onConnectionChange?.(true);
				
				// Send queued messages
				this.flushMessageQueue();
				
				// Subscribe to current doc if set
				if (this.docId) {
					this.subscribe(this.docId);
				}
			};

			this.ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data) as PresenceMessage;
					this.handleMessage(message);
				} catch (err) {
					console.error('[Presence WS] Failed to parse message:', err);
				}
			};

			this.ws.onclose = () => {
				console.log('[Presence WS] Disconnected');
				this.stopHeartbeat();
				this.onConnectionChange?.(false);
				this.attemptReconnect(wsUrl);
			};

			this.ws.onerror = (err) => {
				console.error('[Presence WS] Error:', err);
			};
		} catch (err) {
			console.error('[Presence WS] Failed to connect:', err);
			this.attemptReconnect(wsUrl);
		}
	}

	/**
	 * Attempt to reconnect with exponential backoff
	 */
	private attemptReconnect(wsUrl: string): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('[Presence WS] Max reconnect attempts reached');
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
		
		console.log(`[Presence WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
		
		setTimeout(() => {
			this.connect(wsUrl);
		}, delay);
	}

	/**
	 * Start heartbeat interval
	 */
	private startHeartbeat(): void {
		this.stopHeartbeat();
		
		this.heartbeatInterval = setInterval(() => {
			this.send({
				type: 'heartbeat',
				docId: this.docId || '',
				userId: this.userId,
				timestamp: Date.now()
			});
		}, 15000); // 15 second heartbeat
	}

	/**
	 * Stop heartbeat interval
	 */
	private stopHeartbeat(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	/**
	 * Handle incoming message
	 */
	private handleMessage(message: PresenceMessage): void {
		// Ignore own messages
		if (message.userId === this.userId) return;

		switch (message.type) {
			case 'presence': {
				const presenceMsg = message as PresenceUpdateMessage;
				// Would update local presence state
				console.log('[Presence WS] User presence update:', presenceMsg.data);
				break;
			}
			case 'cursor': {
				const cursorMsg = message as CursorMessage;
				this.onCursorUpdate?.(cursorMsg.userId, {
					offset: cursorMsg.data.offset,
					selection: cursorMsg.data.selection
				});
				break;
			}
		}
	}

	/**
	 * Send message to server
	 */
	private send(message: PresenceMessage): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		} else {
			// Queue message for later
			this.messageQueue.push(message);
		}
	}

	/**
	 * Flush queued messages
	 */
	private flushMessageQueue(): void {
		while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
			const message = this.messageQueue.shift();
			if (message) {
				this.ws.send(JSON.stringify(message));
			}
		}
	}

	/**
	 * Subscribe to a document's presence
	 */
	subscribe(docId: string): void {
		this.docId = docId;
		
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.send({
				type: 'presence',
				docId,
				userId: this.userId,
				data: { action: 'subscribe' },
				timestamp: Date.now()
			});
		}
	}

	/**
	 * Unsubscribe from current document
	 */
	unsubscribe(): void {
		if (this.docId && this.ws?.readyState === WebSocket.OPEN) {
			this.send({
				type: 'presence',
				docId: this.docId,
				userId: this.userId,
				data: { action: 'unsubscribe' },
				timestamp: Date.now()
			});
		}
		this.docId = null;
	}

	/**
	 * Update cursor position
	 */
	updateCursor(offset: number, selection?: { start: number; end: number } | null): void {
		if (!this.docId) return;

		this.send({
			type: 'cursor',
			docId: this.docId,
			userId: this.userId,
			data: { offset, selection },
			timestamp: Date.now()
		});
	}

	/**
	 * Update presence status
	 */
	updatePresence(status: 'active' | 'idle' | 'offline', name?: string, color?: string): void {
		if (!this.docId) return;

		this.send({
			type: 'presence',
			docId: this.docId,
			userId: this.userId,
			data: { name, status, color },
			timestamp: Date.now()
		});
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		this.stopHeartbeat();
		this.unsubscribe();
		this.ws?.close();
		this.ws = null;
	}

	/**
	 * Check if connected
	 */
	isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN;
	}
}

/**
 * Create presence client with reactive integration
 */
export function createPresenceClient(userId: string, wsUrl?: string): WebSocketPresenceClient {
	return new WebSocketPresenceClient(userId, wsUrl);
}
