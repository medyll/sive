<script lang="ts">
	import type { ActiveUser } from '$lib/presenceStore.svelte';

	export let users: ActiveUser[] = [];
	export let showNames = true;

	function getStatusColor(status: ActiveUser['status']): string {
		switch (status) {
			case 'active': return 'bg-green-500';
			case 'idle': return 'bg-yellow-500';
			case 'offline': return 'bg-gray-400';
		}
	}

	function getUserColor(user: ActiveUser): string {
		return user.color || '#6b7280';
	}
</script>

<div class="presence-list space-y-2">
	{#if users.length === 0}
		<div class="text-sm text-muted italic">No active users</div>
	{:else}
		{#each users as user (user.userId)}
			<div class="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
				<!-- Avatar -->
				<div 
					class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
					style="background-color: {getUserColor(user)}"
				>
					{user.name?.charAt(0).toUpperCase() || user.userId.charAt(0).toUpperCase()}
				</div>
				
				<!-- Info -->
				<div class="flex-1 min-w-0">
					{#if showNames}
						<div class="text-sm font-medium truncate">
							{user.name || user.userId}
						</div>
					{/if}
					<div class="flex items-center gap-2 text-xs text-muted">
						<span class="flex items-center gap-1">
							<span class="w-2 h-2 rounded-full {getStatusColor(user.status)}"></span>
							{user.status}
						</span>
						{#if user.cursor}
							<span>· Position {user.cursor.offset}</span>
						{/if}
					</div>
				</div>
				
				<!-- Last Seen -->
				<div class="text-xs text-muted">
					{new Date(user.lastSeen).toLocaleTimeString()}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.presence-list {
		max-height: 300px;
		overflow-y: auto;
	}
</style>
