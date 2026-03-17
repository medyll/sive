<script lang="ts">
	import {
		suggestionState,
		requestSuggestionNow,
		acceptSuggestion,
		dismissSuggestion
	} from '$lib/suggestionStore.svelte';

	interface SuggestionToolbarProps {
		onReplace?: (original: string, replacement: string) => void;
	}

	let { onReplace }: SuggestionToolbarProps = $props();

	// Toolbar visibility & positioning
	let visible = $state(false);
	let x = $state(0);
	let y = $state(0);
	let selectedText = $state('');

	// Diff preview state
	let showDiff = $state(false);
	let originalText = $state('');

	const MIN_SELECTION_LENGTH = 10;

	function handleMouseup() {
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed) {
			hide();
			return;
		}

		const text = sel.toString().trim();
		if (text.length < MIN_SELECTION_LENGTH) {
			hide();
			return;
		}

		// Position toolbar above the selection
		const range = sel.getRangeAt(0);
		const rect = range.getBoundingClientRect();

		selectedText = text;
		x = rect.left + rect.width / 2;
		y = rect.top + window.scrollY - 48; // 48px above selection
		visible = true;
		showDiff = false;
	}

	function hide() {
		visible = false;
		showDiff = false;
		selectedText = '';
		dismissSuggestion();
	}

	async function handleMode(mode: 'rewrite' | 'tone') {
		originalText = selectedText;
		showDiff = true;
		requestSuggestionNow('', mode, selectedText);
	}

	function handleAccept() {
		const replacement = acceptSuggestion();
		onReplace?.(originalText, replacement);
		hide();
	}

	function handleDismiss() {
		hide();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') hide();
	}
</script>

<svelte:window onmouseup={handleMouseup} onkeydown={handleKeydown} />

{#if visible}
	<!-- Floating toolbar -->
	<div
		class="suggestion-toolbar"
		style="left: {x}px; top: {y}px;"
		role="toolbar"
		aria-label="AI suggestion toolbar"
	>
		<button
			class="toolbar-btn"
			onclick={() => handleMode('rewrite')}
			title="Rewrite selection"
			aria-label="Rewrite"
		>
			✨ Rewrite
		</button>

		<button
			class="toolbar-btn"
			onclick={() => handleMode('tone')}
			title="Make more vivid"
			aria-label="Make vivid"
		>
			🎨 Vivid
		</button>

		<button
			class="toolbar-btn toolbar-btn--dismiss"
			onclick={hide}
			title="Dismiss"
			aria-label="Dismiss toolbar"
		>
			✕
		</button>
	</div>

	<!-- Diff preview (shown after requesting suggestion) -->
	{#if showDiff}
		<div
			class="diff-preview"
			style="left: {x}px; top: {y + 52}px;"
			role="dialog"
			aria-label="Suggested rewrite preview"
		>
			{#if suggestionState.pending && !suggestionState.suggestion}
				<div class="diff-loading">
					<span class="diff-spinner"></span>
					Generating suggestion…
				</div>
			{:else if suggestionState.suggestion}
				<div class="diff-body">
					<div class="diff-section diff-original">
						<span class="diff-label">Original</span>
						<p class="diff-text">{originalText}</p>
					</div>
					<div class="diff-divider">↓</div>
					<div class="diff-section diff-suggested">
						<span class="diff-label">Suggested</span>
						<p class="diff-text">{suggestionState.suggestion}</p>
					</div>
				</div>
				<div class="diff-actions">
					<button class="diff-accept" onclick={handleAccept}>Accept</button>
					<button class="diff-dismiss" onclick={handleDismiss}>Dismiss</button>
				</div>
			{:else if suggestionState.error}
				<div class="diff-error">{suggestionState.error}</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.suggestion-toolbar {
		position: absolute;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: #1f2937;
		border-radius: 0.5rem;
		padding: 0.375rem 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
		z-index: 100;
		white-space: nowrap;
	}

	.toolbar-btn {
		padding: 0.25rem 0.625rem;
		border: none;
		background: transparent;
		color: #f9fafb;
		font-size: 0.8rem;
		font-family: inherit;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: background-color 0.15s;
	}

	.toolbar-btn:hover {
		background: #374151;
	}

	.toolbar-btn--dismiss {
		color: #9ca3af;
		font-size: 0.75rem;
		padding: 0.25rem 0.375rem;
	}

	/* Diff preview */
	.diff-preview {
		position: absolute;
		transform: translateX(-50%);
		width: min(380px, 90vw);
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		z-index: 100;
		overflow: hidden;
	}

	.diff-loading {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.diff-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid #e5e7eb;
		border-top-color: #6366f1;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.diff-body {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.diff-section {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.diff-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #9ca3af;
	}

	.diff-text {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #374151;
		max-height: 6rem;
		overflow-y: auto;
	}

	.diff-original .diff-text {
		color: #6b7280;
		text-decoration: line-through;
		text-decoration-color: #fca5a5;
	}

	.diff-suggested .diff-text {
		color: #1f2937;
	}

	.diff-divider {
		text-align: center;
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.diff-actions {
		display: flex;
		gap: 0;
		border-top: 1px solid #f3f4f6;
	}

	.diff-accept,
	.diff-dismiss {
		flex: 1;
		padding: 0.75rem;
		border: none;
		font-size: 0.875rem;
		font-family: inherit;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.diff-accept {
		background: #6366f1;
		color: white;
		font-weight: 600;
	}

	.diff-accept:hover {
		background: #4f46e5;
	}

	.diff-dismiss {
		background: white;
		color: #6b7280;
		border-left: 1px solid #f3f4f6;
	}

	.diff-dismiss:hover {
		background: #f9fafb;
	}

	.diff-error {
		padding: 1rem;
		color: #dc2626;
		font-size: 0.875rem;
	}

	/* Mobile */
	@media (max-width: 640px) {
		.suggestion-toolbar {
			left: 50% !important;
		}

		.diff-preview {
			left: 50% !important;
			transform: translateX(-50%);
		}
	}
</style>
