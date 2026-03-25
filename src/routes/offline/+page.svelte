<script lang="ts">
	function retry() { window.location.reload(); }
</script>

<svelte:head>
	<title>Offline — Sive</title>
</svelte:head>

<main class="offline-page">
	<div class="offline-card">
		<div class="offline-icon">📶</div>
		<h1>You're offline</h1>
		<p>Sive can't reach the server right now. Check your connection and try again.</p>
		<p class="tip">💡 Your locally cached documents are still accessible.</p>
		<button onclick={retry}>Try again</button>
		<a href="/" class="back-link">← Back to app</a>
	</div>
</main>

<style>
	.offline-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg, #f9fafb);
		padding: 1rem;
	}
	.offline-card {
		text-align: center;
		background: var(--surface, #fff);
		border-radius: 16px;
		padding: 3rem 2rem;
		box-shadow: 0 4px 24px rgba(0,0,0,0.08);
		max-width: 400px;
		width: 100%;
	}
	.offline-icon { font-size: 3rem; margin-bottom: 1rem; }
	h1 { margin: 0 0 0.75rem; font-size: 1.5rem; }
	p { color: var(--muted, #6b7280); margin: 0 0 0.75rem; line-height: 1.6; }
	.tip { font-size: 0.875rem; background: var(--surface-alt, #f3f4f6); border-radius: 8px; padding: 0.75rem; }
	button {
		margin-top: 1.5rem;
		padding: 0.6rem 1.5rem;
		background: var(--accent, #7c3aed);
		color: #fff;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		width: 100%;
	}
	.back-link {
		display: block;
		margin-top: 1rem;
		color: var(--muted, #9ca3af);
		font-size: 0.875rem;
		text-decoration: none;
	}
	.back-link:hover { text-decoration: underline; }
</style>
