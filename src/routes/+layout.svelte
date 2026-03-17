<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import OfflineBanner from '$lib/elements/OfflineBanner.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<OfflineBanner />
{@render children()}
