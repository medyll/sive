<script lang="ts">
	import { outlineStore, type OutlineNode } from '$lib/outlineStore.svelte';

	interface Props {
		docId?: string;
		content?: string;
	}

	let { docId = '', content = '' }: Props = $props();

	let topic = $state('');

	function handleGenerate() {
		if (!topic.trim() && !content.trim()) return;
		outlineStore.generate(topic.trim(), '');
	}

	function handleFromDocument() {
		outlineStore.generate('', content);
	}

	function insertNode(text: string) {
		window.dispatchEvent(new CustomEvent('outline:insert', { detail: { text } }));
	}
</script>

<div class="outline-panel" data-testid="outline-panel">
	<div class="outline-controls">
		<input
			class="topic-input"
			bind:value={topic}
			placeholder="Enter a topic to outline…"
			onkeydown={(e) => e.key === 'Enter' && handleGenerate()}
		/>
		<div class="btn-row">
			<button
				class="generate-btn"
				onclick={handleGenerate}
				disabled={outlineStore.isGenerating || (!topic.trim() && !content.trim())}
				data-testid="outline-generate-btn"
			>
				{outlineStore.isGenerating ? '⏳ Generating…' : '✨ Generate'}
			</button>
			{#if content.trim()}
				<button
					class="doc-btn"
					onclick={handleFromDocument}
					disabled={outlineStore.isGenerating}
					title="Generate outline from current document"
					data-testid="outline-from-doc-btn"
				>
					📄 From doc
				</button>
			{/if}
			{#if outlineStore.isGenerating}
				<button class="cancel-btn" onclick={() => outlineStore.cancel()}>✕</button>
			{/if}
		</div>
	</div>

	{#if outlineStore.outline.length === 0 && !outlineStore.isGenerating}
		<p class="empty-state">Enter a topic above or click "From doc" to generate an outline.</p>
	{/if}

	{#if outlineStore.outline.length > 0}
		<div class="outline-tree" data-testid="outline-tree">
			{#each outlineStore.outline as node}
				<OutlineNodeEl {node} onInsert={insertNode} />
			{/each}
		</div>
	{/if}
</div>

<!-- Recursive node component via snippet -->
{#snippet OutlineNodeEl(node: OutlineNode, onInsert: (t: string) => void)}
	<details class={`node level-${node.level}`} open>
		<summary class="node-summary">
			<span class="node-text">{node.text}</span>
			<button
				class="insert-btn"
				onclick={(e) => { e.preventDefault(); e.stopPropagation(); onInsert(node.text); }}
				title="Insert heading into editor"
			>+</button>
		</summary>
		{#if node.children.length > 0}
			<div class="children">
				{#each node.children as child}
					{@render OutlineNodeEl(child, onInsert)}
				{/each}
			</div>
		{/if}
	</details>
{/snippet}

<style>
	.outline-panel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		height: 100%;
		overflow-y: auto;
		font-size: 0.82rem;
	}

	.outline-controls {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.topic-input {
		width: 100%;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 0.375rem 0.5rem;
		font-size: 0.82rem;
		box-sizing: border-box;
	}

	.topic-input:focus { outline: 2px solid #7c3aed; border-color: transparent; }

	.btn-row { display: flex; gap: 0.375rem; }

	.generate-btn {
		flex: 1;
		background: #7c3aed;
		color: #fff;
		border: none;
		border-radius: 0.375rem;
		padding: 0.3rem 0.75rem;
		font-size: 0.78rem;
		cursor: pointer;
	}

	.generate-btn:disabled { opacity: 0.5; cursor: default; }
	.generate-btn:not(:disabled):hover { background: #6d28d9; }

	.doc-btn {
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 0.3rem 0.5rem;
		font-size: 0.75rem;
		cursor: pointer;
		color: #374151;
	}

	.doc-btn:hover { background: #e5e7eb; }
	.doc-btn:disabled { opacity: 0.5; cursor: default; }

	.cancel-btn {
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 0.3rem 0.5rem;
		cursor: pointer;
		color: #6b7280;
		font-size: 0.75rem;
	}

	.empty-state {
		color: #9ca3af;
		font-size: 0.78rem;
		text-align: center;
		margin: 1rem 0;
	}

	.outline-tree { display: flex; flex-direction: column; gap: 0.2rem; }

	.node { border: none; }
	.node-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		padding: 0.2rem 0.3rem;
		border-radius: 0.25rem;
		list-style: none;
	}

	.node-summary:hover { background: #f3f4f6; }

	.level-2 > .node-summary { font-weight: 600; color: #1f2937; }
	.level-3 > .node-summary { padding-left: 1rem; color: #374151; }
	.level-4 > .node-summary { padding-left: 1.75rem; color: #6b7280; font-size: 0.78rem; }

	.node-text { flex: 1; }

	.insert-btn {
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		padding: 0.05rem 0.35rem;
		font-size: 0.72rem;
		cursor: pointer;
		color: #7c3aed;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.node-summary:hover .insert-btn { opacity: 1; }

	.children { padding-left: 0; }
</style>
