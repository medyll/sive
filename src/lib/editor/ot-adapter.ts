/**
 * Operational Transform (OT) adapter for conflict detection in collaborative editing
 * Detects and resolves conflicts from concurrent edits by multiple users
 */

export interface EditOperation {
	clientId: string;
	userId: string;
	operationId: string;
	timestamp: number;
	type: 'insert' | 'delete';
	position: number;
	content?: string;
	length?: number;
}

export interface ConflictDetection {
	isConflict: boolean;
	clientIds: string[];
	operation1: EditOperation;
	operation2: EditOperation;
	affectedRange: {
		start: number;
		end: number;
	};
}

/**
 * Operational Transform adapter for conflict detection and resolution
 */
export class OTAdapter {
	private operations: Map<string, EditOperation> = new Map();
	private documentLength: number = 0;
	private operationHistory: EditOperation[] = [];

	constructor(initialLength: number = 0) {
		this.documentLength = initialLength;
	}

	/**
	 * Register an edit operation and check for conflicts
	 */
	registerOperation(operation: EditOperation): ConflictDetection | null {
		const conflict = this.detectConflict(operation);

		if (!conflict) {
			this.operations.set(operation.operationId, operation);
			this.operationHistory.push(operation);
			this.updateDocumentLength(operation);
		}

		return conflict;
	}

	/**
	 * Detect conflicts with recently registered operations
	 */
	private detectConflict(newOp: EditOperation): ConflictDetection | null {
		const recentOps = this.operationHistory.slice(-10); // Check last 10 operations

		for (const existingOp of recentOps) {
			// Skip if same client
			if (existingOp.clientId === newOp.clientId) continue;

			// Check if operations overlap
			if (this.operationsOverlap(existingOp, newOp)) {
				return {
					isConflict: true,
					clientIds: [existingOp.clientId, newOp.clientId],
					operation1: existingOp,
					operation2: newOp,
					affectedRange: this.getAffectedRange(existingOp, newOp)
				};
			}
		}

		return null;
	}

	/**
	 * Check if two operations overlap
	 */
	private operationsOverlap(op1: EditOperation, op2: EditOperation): boolean {
		// Same position is a conflict
		if (op1.position === op2.position) {
			return true;
		}

		// Delete operations that overlap with any operation
		if (op1.type === 'delete' || op2.type === 'delete') {
			const range1Start = op1.position;
			const range1End = op1.type === 'delete' ? op1.position + (op1.length || 0) : op1.position + (op1.content?.length || 0);

			const range2Start = op2.position;
			const range2End = op2.type === 'delete' ? op2.position + (op2.length || 0) : op2.position + (op2.content?.length || 0);

			// Check for overlap
			return !(range1End <= range2Start || range2End <= range1Start);
		}

		return false;
	}

	/**
	 * Get the affected range of a conflict
	 */
	private getAffectedRange(op1: EditOperation, op2: EditOperation): { start: number; end: number } {
		const start = Math.min(op1.position, op2.position);
		const end = Math.max(
			op1.position + (op1.content?.length || op1.length || 1),
			op2.position + (op2.content?.length || op2.length || 1)
		);

		return { start, end };
	}

	/**
	 * Transform two operations to resolve conflicts (simple approach)
	 */
	transformOperations(
		op1: EditOperation,
		op2: EditOperation
	): { op1: EditOperation; op2: EditOperation } {
		// Simple transformation: adjust positions based on operation types
		let transformedOp1 = { ...op1 };
		let transformedOp2 = { ...op2 };

		// If op1 is before op2
		if (op1.position < op2.position) {
			// If op1 is insert, shift op2 position
			if (op1.type === 'insert') {
				transformedOp2.position += op1.content?.length || 0;
			}
			// If op1 is delete, shift op2 position backward
			else if (op1.type === 'delete') {
				transformedOp2.position = Math.max(op1.position, transformedOp2.position - (op1.length || 0));
			}
		} else {
			// If op2 is before op1, shift op1
			if (op2.type === 'insert') {
				transformedOp1.position += op2.content?.length || 0;
			} else if (op2.type === 'delete') {
				transformedOp1.position = Math.max(op2.position, transformedOp1.position - (op2.length || 0));
			}
		}

		return { op1: transformedOp1, op2: transformedOp2 };
	}

	/**
	 * Update document length based on operation
	 */
	private updateDocumentLength(operation: EditOperation): void {
		if (operation.type === 'insert') {
			this.documentLength += operation.content?.length || 0;
		} else if (operation.type === 'delete') {
			this.documentLength -= operation.length || 0;
		}
	}

	/**
	 * Get operation history
	 */
	getOperationHistory(limit?: number): EditOperation[] {
		if (limit) {
			return this.operationHistory.slice(-limit);
		}
		return [...this.operationHistory];
	}

	/**
	 * Get current document length
	 */
	getDocumentLength(): number {
		return this.documentLength;
	}

	/**
	 * Clear conflict history (e.g., after user resolves all conflicts)
	 */
	clearConflictHistory(): void {
		this.operations.clear();
	}

	/**
	 * Get statistics about operations
	 */
	getStatistics(): {
		totalOperations: number;
		insertCount: number;
		deleteCount: number;
		clientCount: number;
		lastOperation?: EditOperation;
	} {
		const clients = new Set(this.operationHistory.map((op) => op.clientId));
		const insertCount = this.operationHistory.filter((op) => op.type === 'insert').length;
		const deleteCount = this.operationHistory.filter((op) => op.type === 'delete').length;

		return {
			totalOperations: this.operationHistory.length,
			insertCount,
			deleteCount,
			clientCount: clients.size,
			lastOperation: this.operationHistory[this.operationHistory.length - 1]
		};
	}
}

/**
 * Conflict resolver that suggests resolution strategies
 */
export class ConflictResolver {
	/**
	 * Suggest resolution based on conflict type and timestamps
	 */
	static suggestResolution(conflict: ConflictDetection): string {
		const timeDiff = Math.abs(conflict.operation1.timestamp - conflict.operation2.timestamp);

		if (timeDiff < 100) {
			// Very close in time - likely simultaneous
			return 'Simultaneous edits detected. Please review both changes.';
		}

		if (conflict.operation1.timestamp < conflict.operation2.timestamp) {
			return `Conflicting with ${conflict.operation1.userId}'s earlier edit. Your change may overwrite their work.`;
		} else {
			return `${conflict.operation2.userId} is editing the same area. Consider waiting or coordinating.`;
		}
	}

	/**
	 * Get resolution priority (higher = more urgent)
	 */
	static getResolutionPriority(conflict: ConflictDetection): number {
		if (conflict.operation1.type === 'delete' || conflict.operation2.type === 'delete') {
			return 10; // Delete conflicts are high priority
		}

		const affectedLength = conflict.affectedRange.end - conflict.affectedRange.start;
		return Math.min(5, Math.max(1, Math.floor(affectedLength / 10))); // Scale 1-5 by affected length
	}

	/**
	 * Provide merge strategy recommendation
	 */
	static getMergeStrategy(
		conflict: ConflictDetection
	): 'keep-local' | 'accept-remote' | 'manual-review' {
		// Delete operations always require manual review
		if (conflict.operation1.type === 'delete' || conflict.operation2.type === 'delete') {
			return 'manual-review';
		}

		// Non-overlapping inserts can be kept both
		// For now, flag for manual review on any conflict
		return 'manual-review';
	}
}
