<script lang="ts">
	export type FormatType = 'bold' | 'italic' | 'h1' | 'h2';

	interface Props {
		activeFormats?: Set<FormatType>;
		onformat?: (type: FormatType) => void;
	}

	let { activeFormats = new Set(), onformat }: Props = $props();

	const buttons: { type: FormatType; label: string; title: string }[] = [
		{ type: 'bold',   label: 'B',  title: 'Bold (Ctrl+B)' },
		{ type: 'italic', label: 'I',  title: 'Italic (Ctrl+I)' },
		{ type: 'h1',     label: 'H1', title: 'Heading 1' },
		{ type: 'h2',     label: 'H2', title: 'Heading 2' },
	];
</script>

<div class="fmt-toolbar" role="toolbar" aria-label="Formatting toolbar" data-testid="formatting-toolbar">
	{#each buttons as btn (btn.type)}
		<button
			type="button"
			class={['fmt-btn', activeFormats.has(btn.type) && 'active'].filter(Boolean).join(' ')}
			title={btn.title}
			aria-pressed={activeFormats.has(btn.type)}
			onclick={() => {
				window.dispatchEvent(new CustomEvent('editor:format', { detail: { type: btn.type } }));
				onformat?.(btn.type);
			}}
		>
			{btn.label}
		</button>
	{/each}
</div>

<style>
	.fmt-toolbar {
		display: flex;
		gap: 0.25rem;
		padding: 0.3rem 0.75rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-surface, #f9fafb);
	}

	.fmt-btn {
		padding: 0.15rem 0.45rem;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.3rem;
		background: var(--color-background, #fff);
		color: var(--color-text, #111);
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.1s, border-color 0.1s;
		font-family: inherit;
		min-width: 2rem;
	}

	.fmt-btn:nth-child(2) { font-style: italic; }

	.fmt-btn:hover {
		background: var(--color-hover, #f3f4f6);
		border-color: var(--color-accent, #7c3aed);
	}

	.fmt-btn.active {
		background: var(--color-accent, #7c3aed);
		border-color: var(--color-accent, #7c3aed);
		color: #fff;
	}
</style>
