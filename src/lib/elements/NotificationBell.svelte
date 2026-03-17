<script lang="ts">
	import {
		notificationState,
		markRead,
		markAllRead,
		clearAll
	} from '$lib/notificationStore.svelte';
	import type { Notification } from '$lib/server/notifications';

	let panelOpen = $state(false);

	const TYPE_ICONS: Record<string, string> = {
		doc_shared: '📄',
		doc_edited: '✏️',
		conflict: '⚠️',
		mention: '@',
		system: 'ℹ️'
	};

	function toggle() {
		panelOpen = !panelOpen;
	}

	function close() {
		panelOpen = false;
	}

	async function handleNotificationClick(n: Notification) {
		await markRead(n.id);
		if (n.docId) {
			window.dispatchEvent(new CustomEvent('notification:navigate', { detail: { docId: n.docId } }));
		}
		close();
	}

	function relativeTime(ts: number): string {
		const diff = Date.now() - ts;
		const s = Math.floor(diff / 1000);
		if (s < 60) return 'just now';
		const m = Math.floor(s / 60);
		if (m < 60) return `${m}m ago`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h ago`;
		return `${Math.floor(h / 24)}d ago`;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="bell-wrapper">
	<!-- Bell button -->
	<button
		class="bell-button"
		class:has-unread={notificationState.unreadCount > 0}
		onclick={toggle}
		aria-label={`Notifications${notificationState.unreadCount > 0 ? ` — ${notificationState.unreadCount} unread` : ''}`}
		aria-expanded={panelOpen}
		aria-haspopup="true"
	>
		<svg class="bell-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
		</svg>

		{#if notificationState.unreadCount > 0}
			<span class="badge" aria-hidden="true">
				{notificationState.unreadCount > 99 ? '99+' : notificationState.unreadCount}
			</span>
		{/if}
	</button>

	<!-- Panel -->
	{#if panelOpen}
		<div
			class="panel"
			role="dialog"
			aria-label="Notifications"
			aria-modal="false"
		>
			<!-- Panel header -->
			<div class="panel-header">
				<h2 class="panel-title">Notifications</h2>
				<div class="panel-actions">
					{#if notificationState.unreadCount > 0}
						<button class="action-btn" onclick={markAllRead}>Mark all read</button>
					{/if}
					{#if notificationState.notifications.length > 0}
						<button class="action-btn action-btn--danger" onclick={clearAll}>Clear all</button>
					{/if}
				</div>
			</div>

			<!-- List -->
			<ul class="notification-list" role="list">
				{#if notificationState.notifications.length === 0}
					<li class="empty-state">
						<span class="empty-icon">✓</span>
						<span>You're all caught up</span>
					</li>
				{:else}
					{#each notificationState.notifications as n (n.id)}
						<li class="notification-item" class:unread={!n.read}>
							<button
								class="notification-btn"
								onclick={() => handleNotificationClick(n)}
								aria-label={`${n.title}: ${n.body}`}
							>
								<span class="notif-icon" aria-hidden="true">
									{TYPE_ICONS[n.type] ?? 'ℹ️'}
								</span>
								<div class="notif-content">
									<p class="notif-title">{n.title}</p>
									<p class="notif-body">{n.body}</p>
									<time class="notif-time" datetime={new Date(n.createdAt).toISOString()}>
										{relativeTime(n.createdAt)}
									</time>
								</div>
								{#if !n.read}
									<span class="unread-dot" aria-label="unread"></span>
								{/if}
							</button>
						</li>
					{/each}
				{/if}
			</ul>

			<!-- Connection status -->
			{#if !notificationState.connected}
				<div class="connection-warning">
					⚠️ Reconnecting…
				</div>
			{/if}
		</div>

		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="backdrop" onclick={close} aria-hidden="true"></div>
	{/if}
</div>

<style>
	.bell-wrapper {
		position: relative;
	}

	.bell-button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background: transparent;
		border-radius: 0.5rem;
		cursor: pointer;
		color: #6b7280;
		transition: background-color 0.15s, color 0.15s;
	}

	.bell-button:hover {
		background: #f3f4f6;
		color: #1f2937;
	}

	.bell-button.has-unread {
		color: #4f46e5;
	}

	.bell-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.badge {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 0.25rem;
		background: #ef4444;
		color: white;
		border-radius: 9999px;
		font-size: 0.625rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	/* Panel */
	.panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		width: min(360px, 95vw);
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
		z-index: 200;
		display: flex;
		flex-direction: column;
		max-height: 480px;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1rem 0.75rem;
		border-bottom: 1px solid #f3f4f6;
		flex-shrink: 0;
	}

	.panel-title {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 700;
		color: #111827;
	}

	.panel-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		padding: 0.25rem 0.5rem;
		border: none;
		background: transparent;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: background-color 0.15s;
	}

	.action-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.action-btn--danger:hover {
		background: #fef2f2;
		color: #dc2626;
	}

	/* List */
	.notification-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2.5rem 1rem;
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.empty-icon {
		font-size: 1.5rem;
		color: #10b981;
	}

	.notification-item {
		border-bottom: 1px solid #f9fafb;
	}

	.notification-item.unread {
		background: #f8f7ff;
	}

	.notification-btn {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1rem;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.notification-btn:hover {
		background: #f9fafb;
	}

	.notif-icon {
		font-size: 1.125rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.notif-content {
		flex: 1;
		min-width: 0;
	}

	.notif-title {
		margin: 0 0 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.notif-body {
		margin: 0 0 0.375rem;
		font-size: 0.8125rem;
		color: #6b7280;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.notif-time {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.unread-dot {
		width: 0.5rem;
		height: 0.5rem;
		background: #6366f1;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 0.375rem;
	}

	.connection-warning {
		padding: 0.625rem 1rem;
		background: #fffbeb;
		font-size: 0.75rem;
		color: #92400e;
		border-top: 1px solid #fde68a;
		flex-shrink: 0;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 199;
	}

	@media (max-width: 640px) {
		.panel {
			right: -0.5rem;
			width: 100vw;
			border-radius: 0.75rem 0.75rem 0 0;
			position: fixed;
			bottom: 0;
			top: auto;
			max-height: 70vh;
		}
	}
</style>
