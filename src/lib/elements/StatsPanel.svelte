<script lang="ts">
	import {
		wordCount,
		sentenceCount,
		paragraphCount,
		readingTimeMinutes,
		fleschReadingEase,
		readabilityLabel
	} from '$lib/writingStats';

	interface Props {
		text: string;
		dailyGoal?: number;
	}

	let { text, dailyGoal = 0 }: Props = $props();

	let words = $derived(wordCount(text));
	let sentences = $derived(sentenceCount(text));
	let paragraphs = $derived(paragraphCount(text));
	let readingTime = $derived(readingTimeMinutes(text));
	let fleschScore = $derived(fleschReadingEase(text));
	let readLabel = $derived(readabilityLabel(fleschScore));
	let goalProgress = $derived(dailyGoal > 0 ? Math.min(1, words / dailyGoal) : 0);

	function scoreColor(score: number): string {
		if (score >= 70) return '#16a34a';
		if (score >= 50) return '#d97706';
		return '#dc2626';
	}
</script>

<aside class="stats-panel" aria-label="Document statistics">
	<h3 class="panel-title">Writing Stats</h3>

	<div class="stat-grid">
		<div class="stat">
			<span class="stat-value">{words.toLocaleString()}</span>
			<span class="stat-label">Words</span>
		</div>
		<div class="stat">
			<span class="stat-value">{sentences}</span>
			<span class="stat-label">Sentences</span>
		</div>
		<div class="stat">
			<span class="stat-value">{paragraphs}</span>
			<span class="stat-label">Paragraphs</span>
		</div>
		<div class="stat">
			<span class="stat-value">~{readingTime} min</span>
			<span class="stat-label">Read time</span>
		</div>
	</div>

	<div class="readability">
		<div class="readability-header">
			<span class="readability-label">Readability</span>
			<span class="readability-badge" style="color: {scoreColor(fleschScore)}">
				{readLabel} ({fleschScore})
			</span>
		</div>
		<div class="readability-bar">
			<div
				class="readability-fill"
				style="width: {fleschScore}%; background: {scoreColor(fleschScore)};"
			></div>
		</div>
	</div>

	{#if dailyGoal > 0}
		<div class="goal">
			<div class="goal-header">
				<span class="goal-label">Daily goal</span>
				<span class="goal-count">{words} / {dailyGoal.toLocaleString()} words</span>
			</div>
			<div class="goal-bar">
				<div
					class="goal-fill"
					style="width: {(goalProgress * 100).toFixed(1)}%;"
					class:complete={goalProgress >= 1}
				></div>
			</div>
		</div>
	{/if}
</aside>

<style>
	.stats-panel {
		padding: 1rem;
		background: var(--color-surface, #fff);
		border-top: 1px solid var(--color-border, #e5e7eb);
		font-size: 0.85rem;
	}

	.panel-title {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: #374151;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #f9fafb;
		border-radius: 0.375rem;
		padding: 0.5rem 0.25rem;
	}

	.stat-value {
		font-size: 1.1rem;
		font-weight: 700;
		color: #1f2937;
	}

	.stat-label {
		font-size: 0.7rem;
		color: #9ca3af;
		margin-top: 0.125rem;
	}

	.readability { margin-bottom: 0.75rem; }

	.readability-header, .goal-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.25rem;
		font-size: 0.78rem;
	}

	.readability-label, .goal-label { color: #6b7280; }
	.readability-badge { font-weight: 600; }

	.readability-bar, .goal-bar {
		height: 6px;
		background: #f3f4f6;
		border-radius: 9999px;
		overflow: hidden;
	}

	.readability-fill, .goal-fill {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.3s ease;
	}

	.goal-fill { background: #7c3aed; }
	.goal-fill.complete { background: #16a34a; }

	.goal { margin-top: 0.75rem; }
	.goal-count { color: #374151; font-weight: 500; }
</style>
