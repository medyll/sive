<script lang="ts">
	import './layout.css';
	import '@medyll/css-base';
	import favicon from '$lib/assets/favicon.svg';
	import OfflineBanner from '$lib/elements/OfflineBanner.svelte';
	import InstallPrompt from '$lib/elements/InstallPrompt.svelte';
	import MilestoneNotification from '$lib/elements/MilestoneNotification.svelte';
	import NotificationBell from '$lib/elements/NotificationBell.svelte';
	import { browser } from '$app/environment';
	import { themeStore } from '$lib/themeStore.svelte';
	import { pwaStore } from '$lib/pwaStore.svelte';

	let { children } = $props();

	if (browser) themeStore.init();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<OfflineBanner />
{#if browser && !pwaStore.installed}
	<InstallPrompt />
{/if}
<MilestoneNotification />
<div style="position:fixed;top:1rem;right:1rem;z-index:200;">
	<NotificationBell />
</div>
{@render children()}
