<script lang="ts">
	import { ghostTextStore } from '$lib/ghostTextStore.svelte';

	interface Props {
		ghostTextX?: number;
		ghostTextY?: number;
	}

	let { ghostTextX = 100, ghostTextY = 200 }: Props = $props();
</script>

{#if ghostTextStore.isVisible}
	<span class="ghost-text" style="top: {ghostTextY}px; left: {ghostTextX}px;">
		{ghostTextStore.displayText}
	</span>
{/if}

<style>
	.ghost-text {
		position: absolute;
		color: #9ca3af;
		opacity: 0.6;
		pointer-events: none;
		font-style: italic;
		white-space: pre;
		user-select: none;
		font-family: 'Georgia', serif;
		font-size: 1rem;
		line-height: 1.75;
	}
</style>
