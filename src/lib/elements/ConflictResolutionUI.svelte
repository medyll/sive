<script lang="ts">
	export type ConflictType = 'edit' | 'delete' | 'move' | 'format';
	
	export interface Conflict {
		id: string;
		type: ConflictType;
		description: string;
		yourChange: string;
		theirChange: string;
		timestamp: number;
		otherUserId: string;
		otherUserName?: string;
		resolved: boolean;
	}
	
	export let conflicts: Conflict[] = $state([]);
	export let autoResolve = $state(false);
	
	function resolveConflict(conflictId: string, choice: 'yours' | 'theirs' | 'merge') {
		const conflict = conflicts.find(c => c.id === conflictId);
		if (conflict) {
			conflict.resolved = true;
			console.log(`[Conflict] Resolved ${conflictId} with choice: ${choice}`);
			// Would apply the chosen resolution
		}
	}
	
	function getConflictIcon(type: ConflictType): string {
		switch (type) {
			case 'edit': return '✏️';
			case 'delete': return '🗑️';
			case 'move': return '📍';
			case 'format': return '🎨';
		}
	}
	
	function getTimeAgo(timestamp: number): string {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 60) return 'just now';
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
		return `${Math.floor(seconds / 3600)}h ago`;
	}
</script>

<div class="conflict-resolution-ui p-4 space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Edit Conflicts</h3>
		<label class="flex items-center gap-2 text-sm">
			<input type="checkbox" bind:checked={autoResolve} />
			Auto-resolve minor conflicts
		</label>
	</div>
	
	{#if conflicts.length === 0}
		<div class="text-sm text-muted italic">No conflicts</div>
	{:else}
		<div class="space-y-3">
			{#each conflicts.filter(c => !c.resolved) as conflict (conflict.id)}
				<div class="border rounded-lg p-3 bg-muted/30">
					<div class="flex items-start gap-3 mb-2">
						<span class="text-xl">{getConflictIcon(conflict.type)}</span>
						<div class="flex-1">
							<div class="font-medium">{conflict.description}</div>
							<div class="text-xs text-muted">
								{conflict.otherUserName || conflict.otherUserId} · {getTimeAgo(conflict.timestamp)}
							</div>
						</div>
					</div>
					
					<div class="grid grid-cols-2 gap-2 mb-3">
						<div class="p-2 bg-red-50 rounded text-xs">
							<div class="font-medium text-red-700 mb-1">Their change</div>
							<div class="font-mono">{conflict.theirChange}</div>
						</div>
						<div class="p-2 bg-blue-50 rounded text-xs">
							<div class="font-medium text-blue-700 mb-1">Your change</div>
							<div class="font-mono">{conflict.yourChange}</div>
						</div>
					</div>
					
					<div class="flex gap-2">
						<button 
							onclick={() => resolveConflict(conflict.id, 'theirs')}
							class="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 rounded"
						>
							Theirs
						</button>
						<button 
							onclick={() => resolveConflict(conflict.id, 'merge')}
							class="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 rounded"
						>
							Merge
						</button>
						<button 
							onclick={() => resolveConflict(conflict.id, 'yours')}
							class="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 rounded"
						>
							Yours
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
