/**
 * Conflict Resolution Store
 * 
 * Manages edit conflicts in collaborative editing.
 * Detects and resolves concurrent modifications.
 */

import type { Conflict, ConflictType } from '../elements/ConflictResolutionUI.svelte';

interface Operation {
	id: string;
	type: 'insert' | 'delete' | 'replace';
	position: number;
	content?: string;
	length?: number;
	timestamp: number;
	userId: string;
}

function createConflictStore() {
	let conflicts = $state<Conflict[]>([]);
	let autoResolve = $state(false);
	let operationBuffer: Operation[] = [];
	
	/**
	 * Add a conflict
	 */
	function addConflict(conflict: Omit<Conflict, 'id' | 'timestamp' | 'resolved'>): void {
		const newConflict: Conflict = {
			...conflict,
			id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: Date.now(),
			resolved: false
		};
		
		if (autoResolve && ['format', 'move'].includes(conflict.type)) {
			// Auto-resolve minor conflicts
			newConflict.resolved = true;
			console.log('[Conflict] Auto-resolved:', newConflict.type);
		}
		
		conflicts.push(newConflict);
	}
	
	/**
	 * Detect conflicts between operations
	 */
	function detectConflicts(localOp: Operation, remoteOp: Operation): void {
		// Simple conflict detection: overlapping positions
		const localStart = localOp.position;
		const localEnd = localOp.position + (localOp.length || 0);
		const remoteStart = remoteOp.position;
		const remoteEnd = remoteOp.position + (remoteOp.length || 0);
		
		// Check for overlap
		if (localStart < remoteEnd && localEnd > remoteStart) {
			addConflict({
				type: localOp.type === 'delete' || remoteOp.type === 'delete' ? 'delete' : 'edit',
				description: 'Concurrent edits detected',
				yourChange: localOp.content || `${localOp.length} chars`,
				theirChange: remoteOp.content || `${remoteOp.length} chars`,
				otherUserId: remoteOp.userId
			});
		}
	}
	
	/**
	 * Resolve a conflict
	 */
	function resolveConflict(conflictId: string, choice: 'yours' | 'theirs' | 'merge'): void {
		const conflict = conflicts.find(c => c.id === conflictId);
		if (conflict) {
			conflict.resolved = true;
			console.log(`[Conflict] Resolved ${conflictId} with choice: ${choice}`);
			// Would apply the chosen resolution to the document
		}
	}
	
	/**
	 * Clear resolved conflicts
	 */
	function clearResolved(): void {
		conflicts = conflicts.filter(c => !c.resolved);
	}
	
	/**
	 * Get unresolved conflicts count
	 */
	function getUnresolvedCount(): number {
		return conflicts.filter(c => !c.resolved).length;
	}
	
	/**
	 * Set auto-resolve mode
	 */
	function setAutoResolve(enabled: boolean): void {
		autoResolve = enabled;
	}
	
	return {
		get conflicts() { return conflicts; },
		get autoResolve() { return autoResolve; },
		addConflict,
		detectConflicts,
		resolveConflict,
		clearResolved,
		getUnresolvedCount,
		setAutoResolve
	};
}

export const conflictStore = createConflictStore();
