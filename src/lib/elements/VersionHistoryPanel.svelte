<script lang="ts">
	import { computeDiff, renderDiffHtml } from '$lib/diff';

	interface VersionMeta {
		id: string;
		docId: string;
		createdAt: string;
		label?: string;
		wordCount: number;
		title: string;
	}

	interface Props {
		docId: string | null;
		currentContent?: string;
		onrestore?: (content: string, title: string) => void;
	}

	let { docId, currentContent = '', onrestore }: Props = $props();

	let versions = $state<VersionMeta[]>([]);
	let selected = $state<VersionMeta | null>(null);
	let selectedContent = $state('');
	let diffHtml = $state('');
	let confirming = $state(false);
	let editingLabel = $state<string | null>(null);
	let labelDraft = $state('');
	let loading = $state(false);

	$effect(() => {
		if (docId) fetchVersions();
	});

	async function fetchVersions() {
		if (!docId) return;
		loading = true;
		try {
			const res = await fetch(`/api/versions?docId=${encodeURIComponent(docId)}`);
			if (res.ok) versions = await res.json();
		} finally {
			loading = false;
		}
	}

	async function selectVersion(v: VersionMeta) {
		selected = v;
		// Fetch full content via restore preview (read-only)
		const res = await fetch('/api/versions?docId=' + encodeURIComponent(v.docId));
		// We don't have content in meta — request restore preview
		const preview = await fetch('/api/versions?action=preview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ docId: v.docId, versionId: v.id })
		});
		// Fallback: just show diff header if preview not available
		if (preview.ok) {
			const data = await preview.json();
			selectedContent = data.content ?? '';
		}
		const chunks = computeDiff(currentContent, selectedContent);
		diffHtml = renderDiffHtml(chunks);
	}

	async function confirmRestore() {
		if (!selected || !docId) return;
		const res = await fetch('/api/versions?action=restore', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ docId, versionId: selected.id })
		});
		if (res.ok) {
			const { content, title } = await res.json();
			onrestore?.(content, title);
			confirming = false;
			selected = null;
		}
	}

	async function saveLabel(v: VersionMeta) {
		await fetch('/api/versions?action=label', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ docId: v.docId, versionId: v.id, label: labelDraft })
		});
		v.label = labelDraft;
		versions = [...versions];
		editingLabel = null;
	}

	function relativeTime(iso: string) {
		const diff = Date.now() - new Date(iso).getTime();
		const m = Math.floor(diff / 60000);
		if (m < 1) return 'just now';
		if (m < 60) return `${m}m ago`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h ago`;
		return `${Math.floor(h / 24)}d ago`;
	}
</script>

<div class="version-panel">
	<h3 class="panel-title">Version History</h3>

	{#if loading}
		<p class="empty">Loading…</p>
	{:else if versions.length === 0}
		<p class="empty">No versions saved yet.</p>
	{:else}
		<ul class="version-list">
			{#each versions as v (v.id)}
				<li class={['version-item', selected?.id === v.id && 'active'].filter(Boolean).join(' ')}>
					<button class="version-btn" onclick={() => selectVersion(v)}>
						<span class="v-time">{relativeTime(v.createdAt)}</span>
						<span class="v-words">{v.wordCount} words</span>
						{#if v.label}
							<span class="v-label">{v.label}</span>
						{/if}
					</button>
					{#if editingLabel === v.id}
						<div class="label-edit">
							<input bind:value={labelDraft} placeholder="Label…" maxlength="80" />
							<button onclick={() => saveLabel(v)}>Save</button>
							<button onclick={() => (editingLabel = null)}>✕</button>
						</div>
					{:else}
						<button class="label-btn" onclick={() => { editingLabel = v.id; labelDraft = v.label ?? ''; }}>
							✏
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if selected}
		<div class="diff-pane">
			<div class="diff-header">
				<span>Comparing: <strong>{relativeTime(selected.createdAt)}</strong> vs current</span>
				<button class="restore-btn" onclick={() => (confirming = true)}>Restore this version</button>
			</div>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<pre class="diff-view">{@html diffHtml || '(No diff available)'}</pre>
		</div>
	{/if}

	{#if confirming}
		<div class="confirm-overlay">
			<div class="confirm-box">
				<p>Restore this version? Current content will be replaced.</p>
				<div class="confirm-actions">
					<button onclick={() => (confirming = false)}>Cancel</button>
					<button class="primary" onclick={confirmRestore}>Restore</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.version-panel { display: flex; flex-direction: column; height: 100%; font-size: 0.875rem; }
	.panel-title { margin: 0 0 0.75rem; font-size: 0.95rem; font-weight: 600; }
	.empty { color: var(--muted, #9ca3af); text-align: center; padding: 1rem; }
	.version-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; max-height: 40%; }
	.version-item { display: flex; align-items: center; gap: 0.25rem; border-bottom: 1px solid var(--border, #e5e7eb); }
	.version-item.active .version-btn { background: var(--accent-light, #ede9fe); }
	.version-btn { flex: 1; display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0.75rem; background: none; border: none; cursor: pointer; text-align: left; }
	.v-time { font-weight: 500; }
	.v-words { color: var(--muted, #9ca3af); font-size: 0.75rem; }
	.v-label { background: var(--accent-light, #ede9fe); color: var(--accent, #7c3aed); font-size: 0.7rem; padding: 0.1em 0.4em; border-radius: 99px; }
	.label-btn { background: none; border: none; cursor: pointer; color: var(--muted, #9ca3af); font-size: 0.75rem; padding: 0.25rem; }
	.label-edit { display: flex; gap: 0.25rem; padding: 0.25rem; }
	.label-edit input { flex: 1; font-size: 0.75rem; padding: 0.2rem 0.4rem; border: 1px solid var(--border, #e5e7eb); border-radius: 4px; }
	.label-edit button { font-size: 0.7rem; padding: 0.2rem 0.4rem; border: 1px solid var(--border, #e5e7eb); border-radius: 4px; cursor: pointer; background: none; }
	.diff-pane { flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-top: 0.75rem; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; }
	.diff-header { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--surface-alt, #f9fafb); border-bottom: 1px solid var(--border, #e5e7eb); font-size: 0.8rem; }
	.restore-btn { padding: 0.3rem 0.7rem; background: var(--accent, #7c3aed); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
	.diff-view { flex: 1; overflow-y: auto; padding: 0.75rem; margin: 0; font-size: 0.8rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
	.diff-view :global(ins) { background: #dcfce7; color: #15803d; text-decoration: none; display: block; }
	.diff-view :global(del) { background: #fee2e2; color: #dc2626; text-decoration: line-through; display: block; }
	.confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 300; display: flex; align-items: center; justify-content: center; }
	.confirm-box { background: var(--surface, #fff); border-radius: 10px; padding: 1.5rem; width: min(360px, 90vw); }
	.confirm-box p { margin: 0 0 1rem; }
	.confirm-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
	.confirm-actions button { padding: 0.4rem 0.9rem; border-radius: 6px; border: 1px solid var(--border, #e5e7eb); cursor: pointer; background: none; }
	.confirm-actions button.primary { background: var(--accent, #7c3aed); color: #fff; border-color: transparent; }
</style>
