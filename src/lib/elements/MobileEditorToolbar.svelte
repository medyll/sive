<script lang="ts">
	import { toastStore } from '$lib/toastStore.svelte';

	interface Props {
		visible?: boolean;
		onBold?: () => void;
		onItalic?: () => void;
		onUndo?: () => void;
		onRedo?: () => void;
		onAI?: () => void;
	}

	let {
		visible = true,
		onBold,
		onItalic,
		onUndo,
		onRedo,
		onAI
	}: Props = $props();

	let isCollapsed = $state(false);

	function handleAction(action: () => void | undefined, label: string) {
		action?.();
		toastStore.success(`${label} applied`);
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<div class="mobile-toolbar" class:visible class:collapsed={isCollapsed}>
	<div class="toolbar-header">
		<span class="toolbar-label">Formatting</span>
		<button
			class="collapse-btn"
			onclick={toggleCollapse}
			aria-label={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
			aria-expanded={!isCollapsed}
		>
			{isCollapsed ? '🔼' : '🔽'}
		</button>
	</div>

	{#if !isCollapsed}
		<div class="toolbar-actions">
			<button
				class="toolbar-btn"
				onclick={() => handleAction(onBold, 'Bold')}
				aria-label="Bold"
				title="Bold"
			>
				<strong>B</strong>
			</button>

			<button
				class="toolbar-btn"
				onclick={() => handleAction(onItalic, 'Italic')}
				aria-label="Italic"
				title="Italic"
			>
				<em>I</em>
			</button>

			<button
				class="toolbar-btn"
				onclick={() => handleAction(onUndo, 'Undo')}
				aria-label="Undo"
				title="Undo"
			>
				↩️
			</button>

			<button
				class="toolbar-btn"
				onclick={() => handleAction(onRedo, 'Redo')}
				aria-label="Redo"
				title="Redo"
			>
				↪️
			</button>

			<button
				class="toolbar-btn toolbar-btn--ai"
				onclick={() => handleAction(onAI, 'AI Rewrite')}
				aria-label="AI Rewrite"
				title="AI Rewrite"
			>
				✨ AI
			</button>
		</div>
	{/if}
</div>

<style>
	.mobile-toolbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--color-surface, #fff);
		border-top: 1px solid var(--color-border, #e5e7eb);
		box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
		z-index: 150;
		transition: transform 0.2s ease-out;
		display: none;
	}

	.mobile-toolbar.visible {
		display: block;
	}

	.mobile-toolbar.collapsed {
		transform: translateY(calc(100% - 2.75rem));
	}

	.toolbar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--color-background, #f9fafb);
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.toolbar-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary, #666);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.collapse-btn {
		background: none;
		border: none;
		font-size: 1rem;
		color: var(--color-text-secondary, #666);
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		transition: color 0.15s;
	}

	.collapse-btn:hover {
		color: var(--color-text, #111);
	}

	.toolbar-actions {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 0.75rem 0.5rem;
		gap: 0.5rem;
	}

	.toolbar-btn {
		flex: 1;
		max-width: 4rem;
		height: 2.75rem;
		background: var(--color-background, #f3f4f6);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toolbar-btn:active {
		background: var(--color-primary-subtle, #f5f3ff);
		border-color: var(--color-primary, #7c3aed);
		transform: scale(0.98);
	}

	.toolbar-btn--ai {
		background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
		color: white;
		border: none;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.toolbar-btn--ai:active {
		background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%);
	}

	/* Show on mobile */
	@media (max-width: 768px) {
		.mobile-toolbar {
			display: block;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.mobile-toolbar {
			transition: none;
		}

		.toolbar-btn:active {
			transform: none;
		}
	}
</style>
