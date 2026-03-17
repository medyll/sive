<script lang="ts">
	interface TourStep {
		target: string; // CSS selector
		title: string;
		body: string;
		position: 'top' | 'bottom' | 'left' | 'right';
	}

	const STEPS: TourStep[] = [
		{
			target: '[data-tour="document-list"]',
			title: 'Your documents',
			body: 'All your writing lives here. Click any document to open it, or create a new one.',
			position: 'right'
		},
		{
			target: '[data-tour="new-document"]',
			title: 'Create a document',
			body: 'Click here to start a new document. You can also use Cmd+N or pick a template.',
			position: 'bottom'
		},
		{
			target: '[data-tour="editor"]',
			title: 'Write here',
			body: 'Your editor — distraction-free writing with Markdown support. Press Cmd+S to save.',
			position: 'top'
		},
		{
			target: '[data-tour="ai-panel"]',
			title: 'AI writing assistant',
			body: 'Ask your AI assistant anything about your document — suggest, rewrite, or summarise.',
			position: 'left'
		},
		{
			target: '[data-tour="command-palette"]',
			title: 'Command palette',
			body: 'Press Cmd+K to open the command palette. Find any action instantly.',
			position: 'bottom'
		}
	];

	const STORAGE_KEY = 'sive:tour:completed';

	let active = $state(!localStorage.getItem(STORAGE_KEY));
	let stepIndex = $state(0);
	let tooltipStyle = $state('');

	const step = $derived(STEPS[stepIndex]);
	const isLast = $derived(stepIndex === STEPS.length - 1);

	$effect(() => {
		if (active && step) positionTooltip();
	});

	function positionTooltip() {
		const el = document.querySelector(step.target);
		if (!el) { tooltipStyle = 'top:50%;left:50%;transform:translate(-50%,-50%)'; return; }
		const r = el.getBoundingClientRect();
		const gap = 12;
		const positions: Record<string, string> = {
			right: `top:${r.top + r.height / 2}px;left:${r.right + gap}px;transform:translateY(-50%)`,
			left:  `top:${r.top + r.height / 2}px;left:${r.left - gap}px;transform:translate(-100%,-50%)`,
			bottom:`top:${r.bottom + gap}px;left:${r.left + r.width / 2}px;transform:translateX(-50%)`,
			top:   `top:${r.top - gap}px;left:${r.left + r.width / 2}px;transform:translate(-50%,-100%)`
		};
		tooltipStyle = positions[step.position] ?? positions.bottom;
	}

	function next() {
		if (isLast) { complete(); return; }
		stepIndex++;
	}

	function prev() { if (stepIndex > 0) stepIndex--; }

	function complete() {
		localStorage.setItem(STORAGE_KEY, '1');
		active = false;
	}

	function skip() { complete(); }
</script>

{#if active && step}
	<!-- Spotlight overlay -->
	<div class="tour-overlay" aria-hidden="true"></div>

	<!-- Tooltip -->
	<div
		class="tour-tooltip"
		role="dialog"
		aria-modal="false"
		aria-label="Tour step {stepIndex + 1} of {STEPS.length}"
		style={tooltipStyle}
	>
		<div class="tour-header">
			<span class="tour-step">{stepIndex + 1} / {STEPS.length}</span>
			<button class="tour-skip" onclick={skip}>Skip tour</button>
		</div>
		<h3 class="tour-title">{step.title}</h3>
		<p class="tour-body">{step.body}</p>
		<div class="tour-actions">
			{#if stepIndex > 0}
				<button onclick={prev}>← Back</button>
			{/if}
			<button class="primary" onclick={next}>
				{isLast ? 'Done 🎉' : 'Next →'}
			</button>
		</div>
		<!-- Progress dots -->
		<div class="tour-dots" aria-hidden="true">
			{#each STEPS as _, i}
				<span class="dot" class:active={i === stepIndex}></span>
			{/each}
		</div>
	</div>
{/if}

<style>
	.tour-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		z-index: 400;
		pointer-events: none;
	}
	.tour-tooltip {
		position: fixed;
		z-index: 401;
		background: var(--surface, #fff);
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
		padding: 1.25rem;
		width: 280px;
		font-size: 0.875rem;
	}
	.tour-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.tour-step { font-size: 0.7rem; color: var(--muted, #9ca3af); }
	.tour-skip { background: none; border: none; cursor: pointer; font-size: 0.75rem; color: var(--muted, #9ca3af); }
	.tour-title { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; }
	.tour-body { margin: 0 0 1rem; color: var(--text-secondary, #4b5563); line-height: 1.5; }
	.tour-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
	.tour-actions button { padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid var(--border, #e5e7eb); cursor: pointer; background: none; font-size: 0.8rem; }
	.tour-actions button.primary { background: var(--accent, #7c3aed); color: #fff; border-color: transparent; }
	.tour-dots { display: flex; gap: 0.3rem; justify-content: center; margin-top: 0.75rem; }
	.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border, #e5e7eb); }
	.dot.active { background: var(--accent, #7c3aed); }
</style>
