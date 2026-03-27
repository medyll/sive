<script lang="ts">
	import { outlineStore } from '$lib/outlineStore.svelte';

	interface Props {
		onInsert?: () => void;
		onNavigate?: (sectionTitle: string) => void;
	}

	let { onInsert, onNavigate }: Props = $props();

	async function generateOutline() {
		outlineStore.setLoading(true);
		
		try {
			const res = await fetch('/api/ai/outline', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
				// content and topic would be passed from parent component
			});
			
			if (!res.ok) throw new Error('Failed to generate outline');
			
			const data = await res.json();
			outlineStore.setSections(data.sections, 'current-doc');
		} catch (err) {
			outlineStore.setError(err instanceof Error ? err.message : 'Unknown error');
		}
	}

	function handleInsert() {
		onInsert?.();
	}

	function handleNavigate(sectionTitle: string) {
		onNavigate?.(sectionTitle);
	}
</script>

<div class="outline-panel">
	<div class="outline-header">
		<h3>Document Outline</h3>
		<button class="btn-generate" onclick={generateOutline} disabled={outlineStore.isLoading}>
			{outlineStore.isLoading ? 'Generating...' : '✨ Generate Outline'}
		</button>
	</div>

	{#if outlineStore.error}
		<div class="outline-error" role="alert">
			⚠️ {outlineStore.error}
		</div>
	{/if}

	{#if outlineStore.sections.length > 0}
		<div class="outline-actions">
			<button class="btn-insert" onclick={handleInsert}>
				📋 Insert at Cursor
			</button>
		</div>

		<nav class="outline-nav" aria-label="Document outline">
			{#each outlineStore.flatSections as section (section.id)}
				<button
					class="outline-item"
					class:level-1={section.level === 1}
					class:level-2={section.level === 2}
					onclick={() => handleNavigate(section.title)}
				>
					{section.level === 2 ? '  ' : ''}{section.title}
				</button>
			{/each}
		</nav>

		<div class="outline-meta">
			{outlineStore.sectionCount} sections · Generated {outlineStore.generatedAt}
		</div>
	{:else if !outlineStore.isLoading}
		<div class="outline-empty">
			<p>📝 No outline yet</p>
			<p class="outline-hint">Click "Generate Outline" to create a document structure</p>
		</div>
	{/if}
</div>

<style>
	.outline-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1rem;
		background: var(--color-surface, #fff);
	}

	.outline-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.outline-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.btn-generate {
		padding: 0.375rem 0.75rem;
		background: var(--color-primary, #7c3aed);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-generate:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-generate:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.outline-error {
		padding: 0.75rem;
		background: #fef2f2;
		border: 1px solid #fca5a5;
		border-radius: 6px;
		color: #991b1b;
		font-size: 0.8rem;
		margin-bottom: 1rem;
	}

	.outline-actions {
		margin-bottom: 1rem;
	}

	.btn-insert {
		width: 100%;
		padding: 0.5rem 1rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-insert:hover {
		background: var(--color-primary, #7c3aed);
		color: white;
		border-color: var(--color-primary, #7c3aed);
	}

	.outline-nav {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.outline-item {
		padding: 0.5rem 0.75rem;
		background: none;
		border: none;
		border-radius: 4px;
		text-align: left;
		font-size: 0.85rem;
		color: var(--color-text, #111);
		cursor: pointer;
		transition: background 0.15s;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.outline-item:hover {
		background: var(--color-background, #f3f4f6);
	}

	.outline-item.level-1 {
		font-weight: 600;
	}

	.outline-item.level-2 {
		font-weight: 400;
		color: var(--color-text-secondary, #666);
	}

	.outline-meta {
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
		font-size: 0.7rem;
		color: var(--color-text-muted, #9ca3af);
	}

	.outline-empty {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--color-text-secondary, #666);
	}

	.outline-empty p {
		margin: 0.5rem 0;
	}

	.outline-hint {
		font-size: 0.8rem;
		color: var(--color-text-muted, #9ca3af);
	}
</style>
