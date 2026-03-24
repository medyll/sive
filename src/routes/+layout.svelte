<script lang="ts">
	import './layout.css';
	import '@medyll/css-base';
	import favicon from '$lib/assets/favicon.svg';
	import OfflineBanner from '$lib/elements/OfflineBanner.svelte';
	import InstallPrompt from '$lib/elements/InstallPrompt.svelte';
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
{@render children()}
