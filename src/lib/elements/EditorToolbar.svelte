<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		/** Document id */
		documentId?: string;
		/** Document title */
		documentTitle?: string;
	}

	let { documentId = '', documentTitle = 'Untitled Document' }: Props = $props();

	let isFocusMode = $state(false);
	let swReady = $state(false);
	let isOnline = $state(true);

	onMount(() => {
		isOnline = navigator.onLine;
		window.addEventListener('online', () => { isOnline = true; });
		window.addEventListener('offline', () => { isOnline = false; });

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then(() => { swReady = true; });
		}
	});

	function toggleFocusMode() {
		isFocusMode = !isFocusMode;
		// Emit event or update state
		const event = new CustomEvent('focus-mode-toggle', {
			detail: { enabled: isFocusMode }
		});
		window.dispatchEvent(event);
	}

	function handleExport() {
		const event = new CustomEvent('export-document', {
			detail: { documentId, documentTitle }
		});
		window.dispatchEvent(event);
	}

</script>

<div class="editor-toolbar" data-testid="editor-toolbar">
	<div class="toolbar-left">
		<div class="document-info">
			<h2 class="document-title">{documentTitle}</h2>
		</div>
	</div>

	<div class="toolbar-center">
		{#if swReady && !isOnline}
			<span class="offline-ready-chip" title="App cached — works offline">✓ Offline ready</span>
		{/if}
	</div>

	<div class="toolbar-right">
		<!-- Focus Mode Toggle -->
		<button
			class={['toolbar-button', isFocusMode && 'active'].filter(Boolean).join(' ')}
			onclick={toggleFocusMode}
			title="Toggle focus mode (Esc)"
			data-testid="focus-mode-btn"
		>
			<span class="icon">📌</span>
			<span class="label">Focus</span>
		</button>

		<!-- Export Button -->
		<button
			class="toolbar-button"
			onclick={handleExport}
			title="Export document"
			data-testid="export-btn"
		>
			<span class="icon">⬇️</span>
			<span class="label">Export</span>
		</button>
	</div>
</div>

<style>
	.editor-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border, #e0e0e0);
		background: var(--color-surface, #fff);
		gap: 1rem;
	}

	.toolbar-left {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.document-info {
		flex: 1;
		min-width: 0;
	}

	.document-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text, #333);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toolbar-center {
		flex: 1;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}


	.toolbar-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: 0.375rem;
		background: transparent;
		color: var(--color-text-secondary, #666);
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.toolbar-button:hover {
		background: var(--color-hover, #f5f5f5);
		color: var(--color-text, #333);
	}

	.offline-ready-chip {
		font-size: 0.72rem;
		font-weight: 600;
		color: #16a34a;
		background: #dcfce7;
		border: 1px solid #bbf7d0;
		border-radius: 9999px;
		padding: 0.2rem 0.6rem;
		white-space: nowrap;
	}

	.toolbar-button.active {
		background: var(--color-primary, #646cff);
		color: white;
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
	}

	.label {
		display: none;
	}

	@media (min-width: 640px) {
		.label {
			display: inline;
		}
	}

	@media (max-width: 640px) {
		.toolbar-left {
			flex: 1;
		}

		.document-title {
			font-size: 1rem;
		}

		.toolbar-center {
			display: none;
		}

	}
</style>
