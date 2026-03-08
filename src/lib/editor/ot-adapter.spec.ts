import { describe, it, expect, beforeEach } from 'vitest';
import { OTAdapter, ConflictResolver, type EditOperation, type ConflictDetection } from './ot-adapter';

describe('OTAdapter', () => {
	let adapter: OTAdapter;

	beforeEach(() => {
		adapter = new OTAdapter(1000);
	});

	describe('Operation Registration', () => {
		it('registers insert operation without conflict', () => {
			const op: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			};

			const conflict = adapter.registerOperation(op);

			expect(conflict).toBeNull();
			expect(adapter.getOperationHistory().length).toBe(1);
		});

		it('registers delete operation without conflict', () => {
			const op: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'delete',
				position: 100,
				length: 5
			};

			const conflict = adapter.registerOperation(op);

			expect(conflict).toBeNull();
			expect(adapter.getOperationHistory().length).toBe(1);
		});

		it('detects conflict with same position from different clients', () => {
			const op1: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			};

			const op2: EditOperation = {
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 10,
				type: 'insert',
				position: 100,
				content: 'world'
			};

			adapter.registerOperation(op1);
			const conflict = adapter.registerOperation(op2);

			expect(conflict).not.toBeNull();
			expect(conflict?.isConflict).toBe(true);
			expect(conflict?.clientIds).toContain('client1');
			expect(conflict?.clientIds).toContain('client2');
		});

		it('ignores operations from same client', () => {
			const op1: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			};

			const op2: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op2',
				timestamp: Date.now() + 10,
				type: 'insert',
				position: 100,
				content: 'world'
			};

			adapter.registerOperation(op1);
			const conflict = adapter.registerOperation(op2);

			expect(conflict).toBeNull();
		});
	});

	describe('Conflict Detection', () => {
		it('detects delete operation overlapping with insert', () => {
			const insert: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			};

			const delete_op: EditOperation = {
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 10,
				type: 'delete',
				position: 95,
				length: 20 // Overlaps with insert position
			};

			adapter.registerOperation(insert);
			const conflict = adapter.registerOperation(delete_op);

			expect(conflict).not.toBeNull();
			expect(conflict?.isConflict).toBe(true);
		});

		it('detects delete operations at same position as conflict', () => {
			const delete1: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'delete',
				position: 100,
				length: 5
			};

			const delete2: EditOperation = {
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 10,
				type: 'delete',
				position: 100,
				length: 5
			};

			adapter.registerOperation(delete1);
			const conflict = adapter.registerOperation(delete2);

			expect(conflict?.isConflict).toBe(true);
		});

		it('does not detect conflict for non-overlapping operations', () => {
			const op1: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			};

			const op2: EditOperation = {
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 10,
				type: 'insert',
				position: 200,
				content: 'world'
			};

			adapter.registerOperation(op1);
			const conflict = adapter.registerOperation(op2);

			expect(conflict).toBeNull();
		});
	});

	describe('Document Length', () => {
		it('updates document length on insert', () => {
			const op: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			};

			const initialLength = adapter.getDocumentLength();
			adapter.registerOperation(op);

			expect(adapter.getDocumentLength()).toBe(initialLength + 5);
		});

		it('updates document length on delete', () => {
			const op: EditOperation = {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'delete',
				position: 100,
				length: 10
			};

			const initialLength = adapter.getDocumentLength();
			adapter.registerOperation(op);

			expect(adapter.getDocumentLength()).toBe(initialLength - 10);
		});
	});

	describe('Operation History', () => {
		it('stores operation history', () => {
			const ops: EditOperation[] = [];
			for (let i = 0; i < 5; i++) {
				ops.push({
					clientId: `client${i}`,
					userId: `user${i}`,
					operationId: `op${i}`,
					timestamp: Date.now() + i * 100,
					type: i % 2 === 0 ? 'insert' : 'delete',
					position: 100 + i * 10,
					content: i % 2 === 0 ? 'text' : undefined,
					length: i % 2 === 0 ? undefined : 5
				});
			}

			ops.forEach((op) => {
				adapter.registerOperation(op);
			});

			const history = adapter.getOperationHistory();
			expect(history.length).toBeGreaterThan(0);
		});

		it('limits operation history with limit parameter', () => {
			for (let i = 0; i < 15; i++) {
				adapter.registerOperation({
					clientId: 'client1',
					userId: 'user1',
					operationId: `op${i}`,
					timestamp: Date.now() + i * 100,
					type: 'insert',
					position: 100 + i,
					content: 'x'
				});
			}

			const limited = adapter.getOperationHistory(5);
			expect(limited.length).toBeLessThanOrEqual(5);
		});
	});

	describe('Statistics', () => {
		it('calculates operation statistics', () => {
			adapter.registerOperation({
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			});

			adapter.registerOperation({
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 100,
				type: 'delete',
				position: 200,
				length: 5
			});

			const stats = adapter.getStatistics();

			expect(stats.totalOperations).toBe(2);
			expect(stats.insertCount).toBe(1);
			expect(stats.deleteCount).toBe(1);
			expect(stats.clientCount).toBe(2);
		});
	});
});

describe('ConflictResolver', () => {
	it('suggests resolution based on timestamp difference', () => {
		const conflict: ConflictDetection = {
			isConflict: true,
			clientIds: ['client1', 'client2'],
			operation1: {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'insert',
				position: 100,
				content: 'hello'
			},
			operation2: {
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 50,
				type: 'insert',
				position: 100,
				content: 'world'
			},
			affectedRange: { start: 100, end: 105 }
		};

		const suggestion = ConflictResolver.suggestResolution(conflict);

		expect(suggestion).toBeTruthy();
		expect(suggestion.length).toBeGreaterThan(0);
	});

	it('returns high priority for delete conflicts', () => {
		const conflict: ConflictDetection = {
			isConflict: true,
			clientIds: ['client1', 'client2'],
			operation1: {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'delete',
				position: 100,
				length: 5
			},
			operation2: {
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 50,
				type: 'insert',
				position: 100,
				content: 'world'
			},
			affectedRange: { start: 100, end: 110 }
		};

		const priority = ConflictResolver.getResolutionPriority(conflict);

		expect(priority).toBeGreaterThanOrEqual(10);
	});

	it('suggests manual review for delete operations', () => {
		const conflict: ConflictDetection = {
			isConflict: true,
			clientIds: ['client1', 'client2'],
			operation1: {
				clientId: 'client1',
				userId: 'user1',
				operationId: 'op1',
				timestamp: Date.now(),
				type: 'delete',
				position: 100,
				length: 5
			},
			operation2: {
				clientId: 'client2',
				userId: 'user2',
				operationId: 'op2',
				timestamp: Date.now() + 50,
				type: 'insert',
				position: 100,
				content: 'world'
			},
			affectedRange: { start: 100, end: 110 }
		};

		const strategy = ConflictResolver.getMergeStrategy(conflict);

		expect(strategy).toBe('manual-review');
	});
});
