<script lang="ts">
	interface Props {
		content?: string;
	}

	let { content = '' }: Props = $props();

	const wordCount = $derived(content.trim() ? content.trim().split(/\s+/).length : 0);
	const charCount = $derived(content.length);
</script>

<div class="editor-footer" aria-label="Document statistics">
	<span data-testid="word-count">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
	<span class="sep">·</span>
	<span data-testid="char-count">{charCount} char{charCount !== 1 ? 's' : ''}</span>
</div>

<style>
	.editor-footer {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.75rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-surface, #f9fafb);
		font-size: 0.72rem;
		color: var(--color-muted, #9ca3af);
		user-select: none;
	}
	.sep { opacity: 0.4; }
</style>
