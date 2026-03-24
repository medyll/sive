<script lang="ts">
	import type { Comment } from '$lib/commentStore.svelte';

	interface Props {
		comment: Comment;
		onResolve?: (id: string) => void;
		onRemove?: (id: string) => void;
	}

	let { comment, onResolve, onRemove }: Props = $props();

	function relativeTime(ts: number): string {
		const diff = Math.floor((Date.now() - ts) / 1000);
		if (diff < 60) return 'just now';
		if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
		return `${Math.floor(diff / 86400)} days ago`;
	}
</script>

<article class="comment-thread" class:resolved={comment.resolved}>
	<blockquote class="anchor-text">"{comment.anchorText}"</blockquote>
	<p class="body">{comment.body}</p>
	<footer class="meta">
		<time datetime={new Date(comment.createdAt).toISOString()}>
			{relativeTime(comment.createdAt)}
		</time>
		<div class="actions">
			{#if !comment.resolved}
				<button class="resolve-btn" onclick={() => onResolve?.(comment.id)}>Resolve</button>
			{/if}
			<button class="remove-btn" onclick={() => onRemove?.(comment.id)}>✕</button>
		</div>
	</footer>
</article>

<style>
	.comment-thread {
		border-left: 3px solid #f59e0b;
		padding: 0.5rem 0.75rem;
		border-radius: 0 0.375rem 0.375rem 0;
		background: #fffbeb;
		font-size: 0.85rem;
	}

	.comment-thread.resolved {
		opacity: 0.45;
		border-left-color: #d1d5db;
		background: #f9fafb;
	}

	.anchor-text {
		margin: 0 0 0.375rem;
		font-style: italic;
		color: #92400e;
		font-size: 0.78rem;
		border: none;
		padding: 0;
	}

	.body {
		margin: 0 0 0.375rem;
		color: #1f2937;
		line-height: 1.5;
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #9ca3af;
		font-size: 0.72rem;
	}

	.actions { display: flex; gap: 0.375rem; }

	.resolve-btn, .remove-btn {
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.72rem;
		padding: 0.1rem 0.4rem;
		cursor: pointer;
		color: #374151;
	}

	.resolve-btn:hover { background: #d1fae5; border-color: #6ee7b7; }
	.remove-btn:hover  { background: #fee2e2; border-color: #fca5a5; }
</style>
