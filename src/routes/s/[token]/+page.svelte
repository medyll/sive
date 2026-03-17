<script lang="ts">
	import type { PageData } from './$types';

	interface Props { data: PageData }
	let { data }: Props = $props();

	interface Doc { title: string; content: string; updatedAt?: string }
	let doc = $state<Doc | null>(null);
	let error = $state('');

	$effect(() => {
		fetch(`/api/share/content?token=${encodeURIComponent(data.token)}`)
			.then(async (res) => {
				if (!res.ok) { error = 'This link is invalid or has expired.'; return; }
				doc = await res.json();
			})
			.catch(() => { error = 'Failed to load document.'; });
	});

	function renderMarkdown(text: string): string {
		return text
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/^### (.+)$/gm, '<h3>$1</h3>')
			.replace(/^## (.+)$/gm, '<h2>$1</h2>')
			.replace(/^# (.+)$/gm, '<h1>$1</h1>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/\n\n/g, '</p><p>')
			.replace(/^/, '<p>').replace(/$/, '</p>');
	}

	function relativeTime(iso?: string) {
		if (!iso) return '';
		const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
		return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
	}
</script>

<svelte:head>
	<title>{doc?.title ?? 'Shared document'} — Sive</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="shared-page">
	<header class="shared-header">
		<a href="/" class="brand">Sive</a>
		<span class="badge">Read-only</span>
	</header>

	{#if error}
		<div class="error-card">
			<p>⚠️ {error}</p>
			<a href="/">Go to Sive</a>
		</div>
	{:else if !doc}
		<div class="loading">Loading…</div>
	{:else}
		<article class="doc-article">
			<h1 class="doc-title">{doc.title}</h1>
			{#if doc.updatedAt}
				<p class="doc-meta">Last updated {relativeTime(doc.updatedAt)}</p>
			{/if}
			<hr />
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="doc-body">{@html renderMarkdown(doc.content)}</div>
		</article>
	{/if}

	<footer class="shared-footer">
		<a href="/">Write with Sive →</a>
	</footer>
</div>

<style>
	.shared-page { max-width: 720px; margin: 0 auto; padding: 2rem 1.25rem; font-family: Georgia, 'Times New Roman', serif; color: #1f2937; }
	.shared-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
	.brand { font-weight: 700; font-size: 1.1rem; font-family: system-ui, sans-serif; text-decoration: none; color: #7c3aed; }
	.badge { font-size: 0.7rem; background: #f3f4f6; color: #6b7280; padding: 0.2em 0.6em; border-radius: 99px; font-family: system-ui; }
	.doc-title { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; line-height: 1.2; }
	.doc-meta { font-size: 0.875rem; color: #9ca3af; margin: 0 0 1.5rem; font-family: system-ui; }
	hr { border: none; border-top: 1px solid #e5e7eb; margin-bottom: 2rem; }
	.doc-body { line-height: 1.8; font-size: 1.05rem; }
	.doc-body :global(h1) { font-size: 1.6rem; margin: 2rem 0 1rem; }
	.doc-body :global(h2) { font-size: 1.3rem; margin: 1.75rem 0 0.75rem; }
	.doc-body :global(h3) { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
	.doc-body :global(p) { margin: 0 0 1.2rem; }
	.doc-body :global(strong) { font-weight: 700; }
	.doc-body :global(em) { font-style: italic; }
	.error-card { text-align: center; padding: 3rem; color: #6b7280; }
	.loading { text-align: center; padding: 3rem; color: #9ca3af; }
	.shared-footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; text-align: center; font-family: system-ui; font-size: 0.875rem; }
	.shared-footer a { color: #7c3aed; text-decoration: none; }
</style>
