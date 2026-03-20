<script lang="ts">
	import type { Template } from '$lib/server/templates';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		onapply?: (templateId: string, title: string) => void;
	}

	let { open = $bindable(false), onclose, onapply }: Props = $props();

	let templates = $state<Template[]>([]);
	let activeTab = $state<'builtin' | 'user'>('builtin');
	let confirming = $state<Template | null>(null);
	let confirmTitle = $state('');
	let loading = $state(false);

	$effect(() => {
		if (open) fetchTemplates();
	});

	async function fetchTemplates() {
		loading = true;
		try {
			const res = await fetch('/api/templates');
			if (res.ok) templates = await res.json();
		} finally {
			loading = false;
		}
	}

	const builtIn = $derived(templates.filter((t) => t.builtIn));
	const userTemplates = $derived(templates.filter((t) => !t.builtIn));
	const shown = $derived(activeTab === 'builtin' ? builtIn : userTemplates);

	const CATEGORY_COLORS: Record<string, string> = {
		fiction: 'badge-fiction',
		nonfiction: 'badge-nonfiction',
		business: 'badge-business',
		poetry: 'badge-poetry',
		general: 'badge-general'
	};

	function selectTemplate(t: Template) {
		confirming = t;
		confirmTitle = t.name;
	}

	function confirm() {
		if (!confirming) return;
		onapply?.(confirming.id, confirmTitle);
		confirming = null;
		open = false;
		onclose?.();
	}

	function closeAll() {
		confirming = null;
		open = false;
		onclose?.();
	}

	async function deleteTemplate(id: string) {
		await fetch(`/api/templates?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
		templates = templates.filter((t) => t.id !== id);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeAll();
	}
</script>

<svelte:window {onkeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={closeAll}></div>

	<div class="picker" role="dialog" aria-modal="true" aria-label="Template picker">
		<header class="picker-header">
			<h2>New from Template</h2>
			<button class="close-btn" onclick={closeAll} aria-label="Close">✕</button>
		</header>

		<div class="tabs" role="tablist">
			<button
				role="tab"
				aria-selected={activeTab === 'builtin'}
				class={['tab', activeTab === 'builtin' && 'active'].filter(Boolean).join(' ')}
				onclick={() => (activeTab = 'builtin')}
			>
				Built-in
			</button>
			<button
				role="tab"
				aria-selected={activeTab === 'user'}
				class={['tab', activeTab === 'user' && 'active'].filter(Boolean).join(' ')}
				onclick={() => (activeTab = 'user')}
			>
				My Templates
				{#if userTemplates.length > 0}
					<span class="tab-count">{userTemplates.length}</span>
				{/if}
			</button>
		</div>

		<div class="grid">
			{#if loading}
				<p class="empty">Loading…</p>
			{:else if shown.length === 0}
				<div class="empty-state">
					{#if activeTab === 'user'}
						<p>Save your first template from any document</p>
						<p class="hint">Open a document → Actions menu → Save as Template</p>
					{:else}
						<p>No templates found.</p>
					{/if}
				</div>
			{:else}
				{#each shown as t (t.id)}
					<div class="card">
						<div class="card-top">
							<span class="badge {CATEGORY_COLORS[t.category] ?? 'badge-general'}">{t.category}</span>
							{#if !t.builtIn}
								<button
									class="del-btn"
									onclick={() => deleteTemplate(t.id)}
									aria-label="Delete template"
								>
									🗑
								</button>
							{/if}
						</div>
						<h3>{t.name}</h3>
						<p class="desc">{t.description}</p>
						<pre class="preview">{t.content.slice(0, 120)}…</pre>
						<button class="use-btn" onclick={() => selectTemplate(t)}>Use this template</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	{#if confirming}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="confirm-backdrop" onclick={() => (confirming = null)}></div>
		<div class="confirm-dialog" role="dialog" aria-modal="true" aria-label="Confirm template">
			<h3>Create document from template?</h3>
			<p>Template: <strong>{confirming.name}</strong></p>
			<label>
				Document title
				<input type="text" bind:value={confirmTitle} />
			</label>
			<div class="confirm-actions">
				<button onclick={() => (confirming = null)}>Cancel</button>
				<button class="primary" onclick={confirm}>Create</button>
			</div>
		</div>
	{/if}
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 200;
	}
	.picker {
		position: fixed;
		top: 10%;
		left: 50%;
		transform: translateX(-50%);
		width: min(800px, 95vw);
		max-height: 80vh;
		background: var(--surface, #fff);
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		z-index: 201;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem 0.75rem;
		border-bottom: 1px solid var(--border, #e5e7eb);
	}
	.picker-header h2 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
	}
	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		color: var(--muted, #888);
	}
	.tabs {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem 0;
	}
	.tab {
		padding: 0.4rem 0.9rem;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 6px;
		font-size: 0.875rem;
		color: var(--muted, #888);
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.tab.active {
		background: var(--accent-light, #ede9fe);
		color: var(--accent, #7c3aed);
		font-weight: 600;
	}
	.tab-count {
		background: var(--accent, #7c3aed);
		color: #fff;
		border-radius: 99px;
		font-size: 0.7rem;
		padding: 0.1em 0.45em;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
		padding: 1rem 1.25rem;
		overflow-y: auto;
		flex: 1;
	}
	.card {
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		padding: 0.875rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		background: var(--surface-alt, #fafafa);
	}
	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.card h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
	}
	.desc {
		font-size: 0.8rem;
		color: var(--muted, #888);
		margin: 0;
	}
	.preview {
		font-size: 0.72rem;
		color: var(--muted, #888);
		white-space: pre-wrap;
		word-break: break-word;
		background: var(--surface, #fff);
		border-radius: 4px;
		padding: 0.4rem;
		margin: 0;
		flex: 1;
		max-height: 80px;
		overflow: hidden;
	}
	.use-btn {
		margin-top: 0.25rem;
		padding: 0.4rem;
		background: var(--accent, #7c3aed);
		color: #fff;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.8rem;
	}
	.del-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.85rem;
	}
	.badge {
		font-size: 0.65rem;
		padding: 0.15em 0.5em;
		border-radius: 99px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.badge-fiction { background: #dbeafe; color: #1d4ed8; }
	.badge-nonfiction { background: #dcfce7; color: #15803d; }
	.badge-business { background: #fef9c3; color: #a16207; }
	.badge-poetry { background: #fce7f3; color: #be185d; }
	.badge-general { background: #f3f4f6; color: #374151; }
	.empty, .empty-state {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--muted, #888);
		padding: 2rem;
	}
	.empty-state .hint { font-size: 0.8rem; margin-top: 0.5rem; }
	/* confirm dialog */
	.confirm-backdrop {
		position: fixed;
		inset: 0;
		z-index: 210;
	}
	.confirm-dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--surface, #fff);
		border-radius: 10px;
		box-shadow: 0 10px 40px rgba(0,0,0,0.25);
		z-index: 211;
		padding: 1.5rem;
		width: min(400px, 90vw);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.confirm-dialog h3 { margin: 0; font-size: 1rem; }
	.confirm-dialog label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.875rem; }
	.confirm-dialog input { padding: 0.4rem 0.6rem; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; font-size: 0.875rem; }
	.confirm-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
	.confirm-actions button { padding: 0.4rem 0.9rem; border-radius: 6px; border: 1px solid var(--border, #e5e7eb); cursor: pointer; font-size: 0.875rem; background: none; }
	.confirm-actions button.primary { background: var(--accent, #7c3aed); color: #fff; border-color: transparent; }
</style>
