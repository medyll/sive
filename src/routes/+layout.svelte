<script lang="ts">
	import './layout.css';
	import '@medyll/css-base';
	import favicon from '$lib/assets/favicon.svg';
	import OfflineBanner from '$lib/elements/OfflineBanner.svelte';
	import InstallPrompt from '$lib/elements/InstallPrompt.svelte';
	import MilestoneNotification from '$lib/elements/MilestoneNotification.svelte';
	import NotificationBell from '$lib/elements/NotificationBell.svelte';
	import MobileNavDrawer from '$lib/elements/MobileNavDrawer.svelte';
	import MobileEditorToolbar from '$lib/elements/MobileEditorToolbar.svelte';
	import { browser } from '$app/environment';
	import { themeStore } from '$lib/themeStore.svelte';
	import { pwaStore } from '$lib/pwaStore.svelte';
	import { mobileNavStore } from '$lib/mobileNavStore.svelte';

	let { children } = $props();

	if (browser) themeStore.init();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<MobileNavDrawer />
<OfflineBanner />
{#if browser && !pwaStore.installed}
	<InstallPrompt />
{/if}
<MilestoneNotification />
<MobileEditorToolbar
	onBold={() => document.execCommand('bold')}
	onItalic={() => document.execCommand('italic')}
	onUndo={() => document.execCommand('undo')}
	onRedo={() => document.execCommand('redo')}
	onAI={() => console.log('AI rewrite')}
/>

<!-- Mobile hamburger menu button -->
<button
	class="mobile-menu-btn"
	onclick={() => mobileNavStore.toggle()}
	aria-label="Open navigation menu"
	aria-expanded={mobileNavStore.isOpen}
>
	<span class="hamburger"></span>
</button>

<div style="position:fixed;top:1rem;right:1rem;z-index:200;">
	<NotificationBell />
</div>
{@render children()}

<style>
	.mobile-menu-btn {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 200;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		padding: 0.5rem;
		cursor: pointer;
		display: none;
		transition: background 0.15s;
	}

	.mobile-menu-btn:hover {
		background: var(--color-background, #f3f4f6);
	}

	.hamburger {
		display: block;
		width: 24px;
		height: 2px;
		background: var(--color-text, #111);
		position: relative;
		transition: background 0.15s;
	}

	.hamburger::before,
	.hamburger::after {
		content: '';
		position: absolute;
		width: 24px;
		height: 2px;
		background: var(--color-text, #111);
		left: 0;
		transition: transform 0.2s;
	}

	.hamburger::before {
		top: -7px;
	}

	.hamburger::after {
		top: 7px;
	}

	/* Show on mobile */
	@media (max-width: 768px) {
		.mobile-menu-btn {
			display: block;
		}
	}
</style>
