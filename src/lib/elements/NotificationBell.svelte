<script lang="ts">
	import { notificationStore } from '$lib/notificationStore.svelte';

	let open = $state(false);

	function toggle() {
		open = !open;
		if (open) notificationStore.markAllRead();
	}

	function relativeTime(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60_000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
	}

	const typeIcon: Record<string, string> = {
		streak_reminder: '🔥',
		partner_activity: '👥',
		challenge_deadline: '⏰',
		goal_reminder: '🎯'
	};
</script>

<div class="bell-wrapper">
	<button
		type="button"
		class="bell-btn"
		onclick={toggle}
		aria-label="Notifications{notificationStore.unreadCount > 0 ? ` (${notificationStore.unreadCount} unread)` : ''}"
	>
		🔔
		{#if notificationStore.unreadCount > 0}
			<span class="badge">{notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount}</span>
		{/if}
	</button>

	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="backdrop" onclick={() => (open = false)}></div>
		<div class="dropdown" role="dialog" aria-label="Notifications">
			<div class="dropdown-header">
				<span class="dropdown-title">Notifications</span>
				{#if notificationStore.state.items.length > 0}
					<button type="button" class="clear-btn" onclick={() => notificationStore.reset()}>Clear all</button>
				{/if}
			</div>

			{#if notificationStore.state.items.length === 0}
				<p class="empty">No notifications yet</p>
			{:else}
				<ul class="notif-list">
					{#each notificationStore.state.items as notif (notif.id)}
						<li class="notif-item" class:unread={!notif.read}>
							<span class="notif-icon">{typeIcon[notif.type] ?? '📌'}</span>
							<div class="notif-body">
								<p class="notif-msg">{notif.message}</p>
								<span class="notif-time">{relativeTime(notif.createdAt)}</span>
							</div>
							<button
								type="button"
								class="dismiss-btn"
								onclick={() => notificationStore.dismiss(notif.id)}
								aria-label="Dismiss"
							>✕</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

<style>
	.bell-wrapper { position: relative; display: inline-block; }

	.bell-btn {
		position: relative;
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
	}

	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #ef4444;
		color: white;
		font-size: 0.6rem;
		font-weight: 700;
		min-width: 16px;
		height: 16px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 3px;
	}

	.backdrop { position: fixed; inset: 0; z-index: 99; }

	.dropdown {
		position: absolute;
		right: 0;
		top: calc(100% + 8px);
		width: 320px;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0,0,0,0.12);
		z-index: 100;
		overflow: hidden;
	}

	.dropdown-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.dropdown-title { font-weight: 600; font-size: 0.9rem; }

	.clear-btn {
		background: none;
		border: none;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #999);
		cursor: pointer;
	}

	.clear-btn:hover { color: var(--color-text, #111); }

	.empty {
		padding: 2rem 1rem;
		text-align: center;
		color: var(--color-text-secondary, #999);
		font-size: 0.875rem;
		margin: 0;
	}

	.notif-list { list-style: none; margin: 0; padding: 0; max-height: 360px; overflow-y: auto; }

	.notif-item {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border, #f3f4f6);
	}

	.notif-item.unread { background: var(--color-primary-subtle, #f5f3ff); }
	.notif-item:last-child { border-bottom: none; }

	.notif-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
	.notif-body { flex: 1; min-width: 0; }

	.notif-msg { margin: 0; font-size: 0.825rem; color: var(--color-text, #111); line-height: 1.4; }
	.notif-time { font-size: 0.7rem; color: var(--color-text-secondary, #999); }

	.dismiss-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-secondary, #ccc);
		font-size: 0.75rem;
		padding: 0;
		flex-shrink: 0;
	}

	.dismiss-btn:hover { color: var(--color-text, #666); }
</style>
