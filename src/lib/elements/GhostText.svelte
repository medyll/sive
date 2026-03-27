<script lang="ts">
	import { ghostTextStore } from '$lib/ghostTextStore.svelte';

	interface Props {
		position?: { top: number; left: number };
	}

	let { position }: Props = $props();
</script>

{#if ghostTextStore.isVisible}
	<span class="ghost-text" style="top: {position?.top ?? 0}px; left: {position?.left ?? 0}px;">
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
	}
</style>
