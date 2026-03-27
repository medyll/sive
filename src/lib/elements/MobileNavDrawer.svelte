<script lang="ts">
	import { mobileNavStore } from '$lib/mobileNavStore.svelte';
	import { page } from '$app/stores';

	interface NavItem {
		label: string;
		href: string;
		icon: string;
	}

	const navItems: NavItem[] = [
		{ label: 'Documents', href: '/', icon: '📄' },
		{ label: 'Discover', href: '/discover', icon: '🔍' },
		{ label: 'Challenges', href: '/challenges', icon: '🏆' },
		{ label: 'Leaderboard', href: '/leaderboard', icon: '📊' },
		{ label: 'Settings', href: '/settings', icon: '⚙️' }
	];

	function handleNavClick(href: string) {
		mobileNavStore.close();
		// Navigation handled by SvelteKit
	}

	function handleOverlayClick() {
		mobileNavStore.close();
	}

	// Close on Escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && mobileNavStore.isOpen) {
			mobileNavStore.close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if mobileNavStore.isOpen}
	<!-- Overlay -->
	<div class="nav-overlay" onclick={handleOverlayClick} aria-hidden="true"></div>
{/if}

<!-- Drawer -->
<aside
	class="nav-drawer"
	class:open={mobileNavStore.isOpen}
	role="navigation"
	aria-label="Mobile navigation"
	aria-hidden={!mobileNavStore.isOpen}
>
	<div class="nav-header">
		<h2 class="nav-title">Sive</h2>
		<button
			class="nav-close"
			onclick={() => mobileNavStore.close()}
			aria-label="Close navigation"
		>
			✕
		</button>
	</div>

	<nav class="nav-list">
		{#each navItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={$page.url.pathname === item.href}
				onclick={() => handleNavClick(item.href)}
			>
				<span class="nav-icon" aria-hidden="true">{item.icon}</span>
				<span class="nav-label">{item.label}</span>
			</a>
		{/each}
	</nav>

	<div class="nav-footer">
		<p class="nav-version">v0.0.1</p>
	</div>
</aside>

<style>
	.nav-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		opacity: 0;
		animation: fadeIn 0.2s ease-out forwards;
	}

	@keyframes fadeIn {
		to { opacity: 1; }
	}

	.nav-drawer {
		position: fixed;
		top: 0;
		left: 0;
		width: 280px;
		max-width: 85vw;
		height: 100vh;
		background: var(--color-surface, #fff);
		z-index: 1000;
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
	}

	.nav-drawer.open {
		transform: translateX(0);
	}

	.nav-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.nav-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text, #111);
	}

	.nav-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-text-secondary, #666);
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		transition: color 0.15s;
	}

	.nav-close:hover {
		color: var(--color-text, #111);
	}

	.nav-list {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		color: var(--color-text, #111);
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
	}

	.nav-item:hover {
		background: var(--color-background, #f3f4f6);
	}

	.nav-item.active {
		background: var(--color-primary-subtle, #f5f3ff);
		color: var(--color-primary, #7c3aed);
		font-weight: 600;
	}

	.nav-icon {
		font-size: 1.25rem;
		width: 1.5rem;
		text-align: center;
	}

	.nav-label {
		font-size: 1rem;
	}

	.nav-footer {
		padding: 1rem 1.25rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
	}

	.nav-version {
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-text-muted, #9ca3af);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.nav-drawer {
			transition: none;
		}

		.nav-overlay {
			animation: none;
		}
	}
</style>
