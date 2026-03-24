<script lang="ts">
	import { requestSuggestionNow } from '$lib/suggestionStore.svelte';

	interface SelectionToolbarProps {
		selection: string;
		context: string;
		x: number;
		y: number;
		onDismiss?: () => void;
	}

	let { selection, context, x, y, onDismiss }: SelectionToolbarProps = $props();

	let showToneMenu = $state(false);

	const tones = [
		{ label: 'Formal', value: 'formal' },
		{ label: 'Casual', value: 'casual' },
		{ label: 'Concise', value: 'concise' },
		{ label: 'Expand', value: 'expand' }
	];

	function handleRewrite() {
		requestSuggestionNow(context, 'rewrite', selection);
		onDismiss?.();
	}

	function handleTone(tone: string) {
		requestSuggestionNow(context, 'tone', tone + ':' + selection);
		showToneMenu = false;
		onDismiss?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showToneMenu = false;
			onDismiss?.();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="selection-toolbar"
	style="left: {x}px; top: {y}px;"
	role="toolbar"
	aria-label="AI text tools"
>
	<button class="toolbar-btn" onclick={handleRewrite} title="AI Rewrite">
		✏️ Rewrite
	</button>

	<div class="tone-wrapper">
		<button
			class="toolbar-btn"
			onclick={() => (showToneMenu = !showToneMenu)}
			aria-haspopup="true"
			aria-expanded={showToneMenu}
			title="Change tone"
		>
			🎨 Tone ▾
		</button>

		{#if showToneMenu}
			<div class="tone-menu" role="menu">
				{#each tones as tone}
					<button
						class="tone-option"
						role="menuitem"
						onclick={() => handleTone(tone.value)}
					>
						{tone.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.selection-toolbar {
		position: fixed;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: #1f2937;
		border-radius: 0.5rem;
		padding: 0.25rem 0.375rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
		z-index: 200;
		transform: translateX(-50%) translateY(-110%);
	}

	.toolbar-btn {
		background: none;
		border: none;
		color: #f9fafb;
		font-size: 0.78rem;
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.15s;
	}

	.toolbar-btn:hover {
		background: #374151;
	}

	.tone-wrapper {
		position: relative;
	}

	.tone-menu {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 50%;
		transform: translateX(-50%);
		background: #1f2937;
		border-radius: 0.375rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
		overflow: hidden;
		min-width: 7rem;
	}

	.tone-option {
		display: block;
		width: 100%;
		background: none;
		border: none;
		color: #f9fafb;
		font-size: 0.78rem;
		padding: 0.375rem 0.75rem;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}

	.tone-option:hover {
		background: #374151;
	}
</style>
