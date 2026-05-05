<script lang="ts">
	import type { ActiveUser } from '$lib/presenceStore.svelte';

	export interface OnlineUser {
		userId: string;
		clientId: string;
		name?: string;
		status: 'active' | 'idle' | 'offline';
		lastSeen?: number;
		color?: string;
	}

	type UserLike = ActiveUser | OnlineUser;

	interface Props {
		users?: OnlineUser[];
		showNames?: boolean;
		currentUserId?: string | null;
		maxVisible?: number | null;
	}

	let { users = $bindable([]), showNames = true, currentUserId = null, maxVisible = null }: Props = $props();

	function getStatusColor(status: UserLike['status']): string {
		switch (status) {
			case 'active': return 'bg-green-500';
			case 'idle': return 'bg-yellow-500';
			case 'offline': return 'bg-gray-400';
		}
	}

	function getUserColor(user: UserLike): string {
		return user.color || '#6b7280';
	}

	function getInitials(user: UserLike): string {
		if (user.name) {
			return user.name.charAt(0).toUpperCase();
		}
		return user.userId.substring(0, 2).toUpperCase();
	}

	const visibleUsers = $derived(maxVisible ? users.slice(0, maxVisible) : users);
	const hiddenCount = $derived(maxVisible && users.length > maxVisible ? users.length - maxVisible : 0);
</script>

<div class="presence-list space-y-2" data-testid="presence-list">
	{#if users.length === 0}
		<div class="text-sm text-muted italic">No active users</div>
	{:else}
		{#each visibleUsers as user (user.userId)}
			<div class="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
				<!-- Avatar -->
				<div 
					class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium {currentUserId === user.userId ? 'current' : ''}"
					style="background-color: {getUserColor(user)}"
					data-testid="presence-avatar-{user.userId}"
					title={user.name || user.userId}
				>
					{getInitials(user)}
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
		{#if hiddenCount > 0}
			<div class="text-xs text-muted text-center" data-testid="presence-count">+{hiddenCount} more</div>
		{/if}
	{/if}
</div>

<style>
	.presence-list {
		max-height: 300px;
		overflow-y: auto;
	}
</style>
