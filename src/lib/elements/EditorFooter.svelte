<script lang="ts">
	import { browser } from '$app/environment';
	import WritingStatsPanel from './WritingStatsPanel.svelte';
	import { fleschReadingEase, readabilityLabel } from '$lib/writingStats';

	interface Props {
		content?: string;
	}

	let { content = '' }: Props = $props();

	const wordCount = $derived(content.trim() ? content.trim().split(/\s+/).length : 0);
	const charCount = $derived(content.length);

	const fk    = $derived(fleschReadingEase(content));
	const label = $derived(readabilityLabel(fk));

	const STATS_KEY = 'sive.statsPanel';
	let statsOpen = $state(browser ? localStorage.getItem(STATS_KEY) === 'true' : false);

	function toggleStats() {
		statsOpen = !statsOpen;
		if (browser) localStorage.setItem(STATS_KEY, String(statsOpen));
	}

	function badgeColor(score: number): string {
		if (score >= 70) return '#16a34a';
		if (score >= 40) return '#d97706';
		return '#dc2626';
	}
</script>

{#if statsOpen}
	<WritingStatsPanel {content} />
{/if}

<div class="editor-footer" aria-label="Document statistics">
	<span data-testid="word-count">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
	<span class="sep">·</span>
	<span data-testid="char-count">{charCount} char{charCount !== 1 ? 's' : ''}</span>
	<span class="sep">·</span>
	<span
		class="fk-badge"
		data-testid="fk-badge"
		style="color: {badgeColor(fk)}"
		title="Flesch Reading Ease: {label}"
	>{fk} {label}</span>
	<span class="spacer"></span>
	<button class="stats-toggle" onclick={toggleStats} aria-pressed={statsOpen} title="Toggle writing stats">
		{statsOpen ? '▾ Stats' : '▸ Stats'}
	</button>
</div>

<style>
	.editor-footer {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.75rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-surface, #f9fafb);
		font-size: 0.72rem;
		color: var(--color-muted, #9ca3af);
		user-select: none;
	}

	.sep { opacity: 0.4; }

	.fk-badge {
		font-weight: 600;
		font-size: 0.7rem;
	}

	.spacer { flex: 1; }

	.stats-toggle {
		background: none;
		border: none;
		font-size: 0.7rem;
		color: #7c3aed;
		cursor: pointer;
		padding: 0.1rem 0.3rem;
		border-radius: 0.2rem;
	}

	.stats-toggle:hover { background: #f3f4f6; }
</style>
