<script lang="ts">
	import { suggestionState, acceptSuggestion, dismissSuggestion } from '$lib/suggestionStore.svelte';

	interface GhostTextProps {
		onAccept?: (text: string) => void;
	}

	let { onAccept }: GhostTextProps = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (!suggestionState.suggestion) return;

		if (e.key === 'Tab') {
			e.preventDefault();
			const text = acceptSuggestion();
			onAccept?.(text);
		} else if (e.key === 'Escape') {
			dismissSuggestion();
		} else if (e.key.length === 1 || e.key === 'Backspace') {
			// Any printable key or backspace dismisses the suggestion
			dismissSuggestion();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if suggestionState.suggestion || suggestionState.pending}
	<span
		class="ghost-text"
		role="status"
		aria-label={suggestionState.suggestion
			? `AI suggestion: ${suggestionState.suggestion}`
			: 'AI thinking…'}
		aria-live="polite"
	>
		{#if suggestionState.pending && !suggestionState.suggestion}
			<span class="ghost-pending">●●●</span>
		{:else}
			<span class="ghost-content">{suggestionState.suggestion}</span>
			<span class="ghost-hint">Tab to accept · Esc to dismiss</span>
		{/if}
	</span>
{/if}

<style>
	.ghost-text {
		display: inline;
		pointer-events: none;
		user-select: none;
	}

	.ghost-content {
		opacity: 0.38;
		font-style: italic;
		color: inherit;
	}

	.ghost-pending {
		opacity: 0.3;
		font-size: 0.5em;
		letter-spacing: 0.25em;
		vertical-align: middle;
		animation: pulse 1.2s ease-in-out infinite;
	}

	.ghost-hint {
		display: inline-block;
		margin-left: 0.75em;
		opacity: 0;
		font-size: 0.7em;
		font-style: normal;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: #6b7280;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		padding: 0.1em 0.4em;
		pointer-events: none;
		transition: opacity 0.2s;
	}

	.ghost-text:hover .ghost-hint,
	.ghost-text:focus-within .ghost-hint {
		opacity: 1;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.2; }
		50%       { opacity: 0.6; }
	}
</style>
