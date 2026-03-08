import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocketServer } from './ws';

/**
 * Performance and load tests for WebSocket server
 * Tests throughput, latency, memory usage under load
 */

describe('WebSocket Performance', () => {
	let wsServer: WebSocketServer;
	let metrics = {
		messagesProcessed: 0,
		bytesTransferred: 0,
		startTime: 0,
		endTime: 0
	};

	beforeEach(() => {
		wsServer = new WebSocketServer();
		metrics = {
			messagesProcessed: 0,
			bytesTransferred: 0,
			startTime: Date.now(),
			endTime: 0
		};
	});

	afterEach(() => {
		wsServer.shutdown();
		metrics.endTime = Date.now();
	});

	it('should handle 100 concurrent connections', () => {
		const clients = Array.from({ length: 100 }, (_, i) => {
			const clientId = `c${i}`;
			const userId = `user${i}`;
			const sendFn = (data: string) => {
				metrics.messagesProcessed++;
				metrics.bytesTransferred += data.length;
			};

			wsServer.registerClient(clientId, userId, 'doc1', sendFn);
			return { clientId, userId };
		});

		expect(wsServer.getDocumentPresence('doc1').length).toBe(100);

		// Cleanup
		clients.forEach((client) => {
			wsServer.unregisterClient(client.clientId);
		});
	});

	it('should process 1000 messages in reasonable time', () => {
		// Setup clients
		const client1 = 'c1';
		const client2 = 'c2';
		wsServer.registerClient(client1, 'user1', 'doc1', (data) => {
			metrics.messagesProcessed++;
			metrics.bytesTransferred += data.length;
		});
		wsServer.registerClient(client2, 'user2', 'doc1', (data) => {
			metrics.messagesProcessed++;
			metrics.bytesTransferred += data.length;
		});

		const startTime = Date.now();

		// Send 1000 messages
		for (let i = 0; i < 1000; i++) {
			wsServer.handleMessage(
				client1,
				JSON.stringify({
					type: 'cursor',
					clientId: client1,
					documentId: 'doc1',
					userId: 'user1',
					payload: { line: i % 100, column: i % 50 },
					timestamp: Date.now()
				})
			);
		}

		const duration = Date.now() - startTime;

		// Should process 1000 messages in less than 1 second
		expect(duration).toBeLessThan(1000);

		// Performance metrics
		const throughput = Math.round(1000 / (duration / 1000));
		console.log(`Throughput: ${throughput} messages/sec`);
		expect(throughput).toBeGreaterThan(100);
	});

	it('should maintain low latency with message batching', () => {
		const messages = [];
		const sendFn = (data: string) => {
			messages.push({
				data,
				timestamp: Date.now()
			});
		};

		wsServer.registerClient('c1', 'user1', 'doc1', sendFn);
		wsServer.registerClient('c2', 'user2', 'doc1', sendFn);

		const baseTime = Date.now();

		// Send rapid cursor updates
		for (let i = 0; i < 100; i++) {
			wsServer.handleMessage(
				'c1',
				JSON.stringify({
					type: 'cursor',
					clientId: 'c1',
					documentId: 'doc1',
					userId: 'user1',
					payload: { line: i, column: 0 },
					timestamp: Date.now()
				})
			);
		}

		// Measure latencies
		const latencies = messages.map((m) => m.timestamp - baseTime);
		const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
		const maxLatency = Math.max(...latencies);

		console.log(`Average latency: ${avgLatency.toFixed(2)}ms`);
		console.log(`Max latency: ${maxLatency}ms`);

		expect(avgLatency).toBeLessThan(10); // Should be very fast
		expect(maxLatency).toBeLessThan(50);
	});

	it('should handle memory efficiently with many messages', () => {
		const getMemoryUsage = () => {
			const used = process.memoryUsage().heapUsed / 1024 / 1024;
			return Math.round(used);
		};

		const startMem = getMemoryUsage();

		// Create clients
		for (let i = 0; i < 50; i++) {
			wsServer.registerClient(`c${i}`, `user${i}`, 'doc1', () => {});
		}

		// Send messages
		for (let i = 0; i < 1000; i++) {
			wsServer.handleMessage(
				'c0',
				JSON.stringify({
					type: 'edit',
					clientId: 'c0',
					documentId: 'doc1',
					userId: 'user0',
					payload: { text: 'a'.repeat(100), pos: i },
					timestamp: Date.now()
				})
			);
		}

		const endMem = getMemoryUsage();
		const memGrowth = endMem - startMem;

		console.log(`Memory growth: ${memGrowth}MB`);

		// Memory growth should be reasonable (less than 50MB for 1000 msgs)
		expect(memGrowth).toBeLessThan(50);
	});

	it('should cleanup connections quickly', () => {
		// Create and cleanup many connections
		const iterations = 100;
		const startTime = Date.now();

		for (let iter = 0; iter < iterations; iter++) {
			for (let i = 0; i < 10; i++) {
				wsServer.registerClient(`c${iter}-${i}`, `user${i}`, `doc${iter}`, () => {});
			}

			for (let i = 0; i < 10; i++) {
				wsServer.unregisterClient(`c${iter}-${i}`);
			}
		}

		const duration = Date.now() - startTime;

		// Should complete quickly
		expect(duration).toBeLessThan(5000);

		// Final state should be clean
		expect(wsServer.getDocumentPresence('doc0').length).toBe(0);
	});

	it('should handle mixed message types efficiently', () => {
		const sendFn = (data: string) => {
			metrics.messagesProcessed++;
			metrics.bytesTransferred += data.length;
		};

		wsServer.registerClient('c1', 'user1', 'doc1', sendFn);
		wsServer.registerClient('c2', 'user2', 'doc1', sendFn);

		const startTime = Date.now();

		// Mix of different message types
		for (let i = 0; i < 100; i++) {
			if (i % 3 === 0) {
				// Cursor updates
				wsServer.handleMessage(
					'c1',
					JSON.stringify({
						type: 'cursor',
						clientId: 'c1',
						documentId: 'doc1',
						userId: 'user1',
						payload: { line: i, column: i },
						timestamp: Date.now()
					})
				);
			} else if (i % 3 === 1) {
				// Edit operations
				wsServer.handleMessage(
					'c1',
					JSON.stringify({
						type: 'edit',
						clientId: 'c1',
						documentId: 'doc1',
						userId: 'user1',
						payload: { text: 'test', pos: i },
						timestamp: Date.now()
					})
				);
			} else {
				// Heartbeats
				wsServer.handleMessage(
					'c1',
					JSON.stringify({
						type: 'heartbeat',
						clientId: 'c1',
						documentId: 'doc1',
						userId: 'user1',
						timestamp: Date.now()
					})
				);
			}
		}

		const duration = Date.now() - startTime;

		expect(duration).toBeLessThan(500);
		console.log(`Mixed message processing: ${duration}ms for 100 messages`);
	});

	it('should maintain stability under sustained load', () => {
		const clients = Array.from({ length: 20 }, (_, i) => ({
			clientId: `c${i}`,
			userId: `user${i}`
		}));

		// Register all clients
		clients.forEach((client) => {
			wsServer.registerClient(client.clientId, client.userId, 'doc1', () => {});
		});

		// Sustained message sending
		const duration = 5000; // 5 seconds
		const startTime = Date.now();
		let messageCount = 0;

		while (Date.now() - startTime < duration) {
			clients.forEach((client) => {
				wsServer.handleMessage(
					client.clientId,
					JSON.stringify({
						type: 'cursor',
						clientId: client.clientId,
						documentId: 'doc1',
						userId: client.userId,
						payload: { line: Math.random() * 100, column: Math.random() * 50 },
						timestamp: Date.now()
					})
				);
				messageCount++;
			});
		}

		const actualDuration = Date.now() - startTime;
		const throughput = Math.round(messageCount / (actualDuration / 1000));

		console.log(`Sustained throughput: ${throughput} messages/sec`);
		console.log(`Total messages: ${messageCount}`);

		expect(wsServer.getDocumentPresence('doc1').length).toBe(20);
		expect(throughput).toBeGreaterThan(500);
	});
});
