<script lang="ts">
	import { filterSlashCommands, type SlashCommand } from '$lib/slashCommands';

	interface Props {
		query?: string;
		open?: boolean;
		onselect?: (cmd: SlashCommand) => void;
		onclose?: () => void;
	}

	let { query = '', open = false, onselect, onclose }: Props = $props();

	let selectedIndex = $state(0);
	const results = $derived(filterSlashCommands(query));

	$effect(() => {
		// Reset selection when results change
		selectedIndex = 0;
	});

	import { trackEvent } from '$lib/telemetry';

	function select(cmd: SlashCommand) {
		// Telemetry: selection + execution
		trackEvent('slash:select', { id: cmd.id, label: cmd.label, format: cmd.format });
		window.dispatchEvent(new CustomEvent('editor:format', { detail: { type: cmd.format } }));
		// Mark execution (useful if action has side effects)
		trackEvent('slash:execute', { id: cmd.id });
		onselect?.(cmd);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = (selectedIndex + 1) % results.length; }
		else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = (selectedIndex - 1 + results.length) % results.length; }
		else if (e.key === 'Enter') { e.preventDefault(); if (results[selectedIndex]) select(results[selectedIndex]); }
		else if (e.key === 'Escape') { e.preventDefault();
			trackEvent('slash:cancel', { reason: 'escape' });
			onclose?.();
		}
	}

	$effect(() => {
		if (open) {
			trackEvent('slash:open', { query });
			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if open && results.length > 0}
	<div class="slash-menu" role="listbox" aria-label="Slash commands" data-testid="slash-menu">
		{#each results as cmd, i (cmd.id)}
			<button
				type="button"
				class={['slash-item', i === selectedIndex && 'selected'].filter(Boolean).join(' ')}
				role="option"
				aria-selected={i === selectedIndex}
				onclick={() => select(cmd)}
			>
				<span class="slash-icon" aria-hidden="true">{cmd.icon}</span>
				<span class="slash-label">{cmd.label}</span>
				<span class="slash-hint">/{cmd.id}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.slash-menu {
		position: absolute;
		z-index: 200;
		background: var(--color-background, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px rgba(0,0,0,0.12);
		min-width: 200px;
		overflow: hidden;
	}

	.slash-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.45rem 0.75rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.875rem;
		color: var(--color-text, #111);
		text-align: left;
		transition: background 0.1s;
	}

	.slash-item:hover,
	.slash-item.selected {
		background: var(--color-hover, #f3f4f6);
	}

	.slash-icon {
		font-weight: 700;
		font-size: 0.8rem;
		width: 1.5rem;
		text-align: center;
		color: var(--color-accent, #7c3aed);
	}

	.slash-label { flex: 1; font-weight: 500; }

	.slash-hint {
		font-size: 0.7rem;
		color: var(--color-muted, #9ca3af);
	}
</style>
