<script lang="ts">
	import { commentStore } from '$lib/commentStore.svelte';
	import CommentThread from './CommentThread.svelte';

	interface Props {
		docId: string;
		userId?: string;
		selectionText?: string;
		selectionOffset?: number;
	}

	let { docId, userId = 'anonymous', selectionText = '', selectionOffset = 0 }: Props = $props();

	let showForm = $state(false);
	let newBody = $state('');

	$effect(() => {
		if (docId) commentStore.loadDoc(docId);
	});

	function submit() {
		if (!newBody.trim() || !selectionText) return;
		commentStore.add({
			docId,
			userId,
			anchorText: selectionText,
			anchorOffset: selectionOffset,
			body: newBody.trim()
		});
		newBody = '';
		showForm = false;
	}

	function cancel() {
		newBody = '';
		showForm = false;
	}
</script>

<aside class="comment-sidebar" aria-label="Document comments">
	<header class="sidebar-header">
		<span class="title">Comments</span>
		{#if selectionText}
			<button class="add-btn" onclick={() => (showForm = true)}>+ Add comment</button>
		{/if}
	</header>

	{#if showForm}
		<div class="new-comment-form">
			<blockquote class="anchor-preview">"{selectionText}"</blockquote>
			<textarea
				class="comment-input"
				bind:value={newBody}
				placeholder="Add a comment…"
				rows="3"
			></textarea>
			<div class="form-actions">
				<button class="submit-btn" onclick={submit} disabled={!newBody.trim()}>Submit</button>
				<button class="cancel-btn" onclick={cancel}>Cancel</button>
			</div>
		</div>
	{/if}

	<div class="threads">
		{#each commentStore.unresolved as comment (comment.id)}
			<CommentThread
				{comment}
				onResolve={(id) => commentStore.resolve(id)}
				onRemove={(id) => commentStore.remove(id)}
			/>
		{/each}
		{#if commentStore.unresolved.length === 0 && !showForm}
			<p class="empty">No comments yet. Select text to add one.</p>
		{/if}
	</div>
</aside>

<style>
	.comment-sidebar {
		width: 260px;
		flex-shrink: 0;
		border-left: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-surface, #fff);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		font-size: 0.85rem;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
		flex-shrink: 0;
	}

	.title { font-weight: 600; color: #374151; }

	.add-btn {
		background: none;
		border: 1px solid #f59e0b;
		color: #92400e;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		cursor: pointer;
	}

	.add-btn:hover { background: #fffbeb; }

	.new-comment-form {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.anchor-preview {
		margin: 0;
		font-style: italic;
		font-size: 0.78rem;
		color: #92400e;
	}

	.comment-input {
		width: 100%;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 0.375rem 0.5rem;
		font-size: 0.82rem;
		resize: vertical;
		box-sizing: border-box;
	}

	.form-actions { display: flex; gap: 0.5rem; }

	.submit-btn {
		background: #7c3aed;
		color: #fff;
		border: none;
		border-radius: 0.25rem;
		padding: 0.3rem 0.75rem;
		font-size: 0.78rem;
		cursor: pointer;
	}

	.submit-btn:disabled { opacity: 0.5; cursor: default; }
	.submit-btn:not(:disabled):hover { background: #6d28d9; }

	.cancel-btn {
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		padding: 0.3rem 0.6rem;
		font-size: 0.78rem;
		cursor: pointer;
		color: #6b7280;
	}

	.threads {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
	}

	.empty {
		color: #9ca3af;
		font-size: 0.8rem;
		text-align: center;
		margin: 1rem 0;
	}
</style>
