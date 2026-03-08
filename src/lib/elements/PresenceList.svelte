<script lang="ts">
	export interface OnlineUser {
		userId: string;
		clientId: string;
		name?: string;
		status: 'active' | 'idle' | 'offline';
		lastSeen?: number;
	}

	export let users: OnlineUser[] = [];
	export let currentUserId: string | null = null;
	export let maxVisible: number = 5;

	$: visibleUsers = users.slice(0, maxVisible);
	$: hiddenCount = Math.max(0, users.length - maxVisible);

	function getInitials(userId: string): string {
		return userId.slice(0, 2).toUpperCase();
	}

	function getStatusColor(status: OnlineUser['status']): string {
		switch (status) {
			case 'active':
				return 'bg-green-500';
			case 'idle':
				return 'bg-yellow-500';
			case 'offline':
				return 'bg-gray-400';
			default:
				return 'bg-gray-400';
		}
	}

	function getStatusLabel(status: OnlineUser['status']): string {
		switch (status) {
			case 'active':
				return 'Active now';
			case 'idle':
				return 'Idle';
			case 'offline':
				return 'Offline';
			default:
				return 'Unknown';
		}
	}

	function isCurrentUser(userId: string): boolean {
		return userId === currentUserId;
	}
</script>

<div class="presence-list" data-testid="presence-list" title="Online collaborators">
	<div class="presence-avatars">
		{#each visibleUsers as user (user.clientId)}
			<div
				class="presence-avatar"
				class:current={isCurrentUser(user.userId)}
				data-testid="presence-avatar-{user.userId}"
				title="{user.name || user.userId} — {getStatusLabel(user.status)}"
			>
				<div class="avatar-content">
					<span class="initials">{getInitials(user.userId)}</span>
					<div class={`status-dot ${getStatusColor(user.status)}`} aria-hidden="true"></div>
				</div>
			</div>
		{/each}

		{#if hiddenCount > 0}
			<div
				class="presence-count"
				data-testid="presence-count"
				title="{hiddenCount} more collaborator{hiddenCount > 1 ? 's' : ''}"
			>
				+{hiddenCount}
			</div>
		{/if}
	</div>
</div>

<style>
	.presence-list {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.presence-avatars {
		display: flex;
		align-items: center;
		gap: -0.5rem;
		flex-wrap: wrap;
	}

	.presence-avatar {
		position: relative;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-primary, #646cff);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
		border: 2px solid var(--color-background, #fff);
		cursor: pointer;
		transition: all 0.2s ease;
		margin-left: -0.5rem;
	}

	.presence-avatar:first-child {
		margin-left: 0;
	}

	.presence-avatar:hover {
		transform: scale(1.15);
		z-index: 10;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.presence-avatar.current {
		border-color: var(--color-primary, #646cff);
		box-shadow: 0 0 0 2px var(--color-background, #fff),
			0 0 0 4px var(--color-primary, #646cff);
	}

	.avatar-content {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		width: 100%;
		height: 100%;
	}

	.initials {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		letter-spacing: 0.05em;
	}

	.status-dot {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid var(--color-background, #fff);
	}

	.presence-count {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-surface, #f9f9f9);
		border: 2px solid var(--color-border, #ddd);
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--color-text, #333);
		margin-left: 0.25rem;
	}
</style>
