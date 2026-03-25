<script lang="ts">
	import {
		wordCount,
		sentenceCount,
		readingTimeMinutes,
		fleschReadingEase,
		readabilityLabel
	} from '$lib/writingStats';

	interface Props {
		content?: string;
	}

	let { content = '' }: Props = $props();

	// Debounced stats — recompute 300 ms after content stops changing
	let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let _stale = $state('');
	$effect(() => {
		const c = content;
		if (_debounceTimer) clearTimeout(_debounceTimer);
		_debounceTimer = setTimeout(() => (_stale = c), 300);
		return () => { if (_debounceTimer) clearTimeout(_debounceTimer); };
	});

	const words    = $derived(wordCount(_stale));
	const sentences = $derived(sentenceCount(_stale));
	const avgWps   = $derived(sentences > 0 ? +(words / sentences).toFixed(1) : 0);
	const readTime = $derived(readingTimeMinutes(_stale));
	const fk       = $derived(fleschReadingEase(_stale));
	const label    = $derived(readabilityLabel(fk));

	// Top 5 words (excluding stop words)
	const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','of','for','is','it','was','are','be','as','by','with','that','this','i','you','he','she','we','they','do','not','so','if','from','has','have','had','will','would','could','should','its','their','your','our']);

	const topWords = $derived.by(() => {
		const freq: Record<string, number> = {};
		for (const w of _stale.toLowerCase().match(/[a-z']{3,}/g) ?? []) {
			if (!STOP.has(w)) freq[w] = (freq[w] ?? 0) + 1;
		}
		return Object.entries(freq)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([word, count]) => ({ word, count }));
	});

	const maxFreq = $derived(topWords[0]?.count ?? 1);

	function fkColor(score: number): string {
		if (score >= 70) return '#16a34a';
		if (score >= 40) return '#d97706';
		return '#dc2626';
	}
</script>

<div class="stats-panel" data-testid="writing-stats-panel">
	<div class="row">
		<span class="stat"><strong>{words}</strong> words</span>
		<span class="sep">·</span>
		<span class="stat"><strong>{sentences}</strong> sentences</span>
		<span class="sep">·</span>
		<span class="stat"><strong>{avgWps}</strong> avg words/sentence</span>
		<span class="sep">·</span>
		<span class="stat">~<strong>{readTime}</strong> min read</span>
	</div>

	<div class="row fk-row">
		<span class="fk-label" style="color: {fkColor(fk)}">
			<strong>{fk}</strong> / 100 — {label}
		</span>
		<span class="fk-hint">(Flesch Reading Ease)</span>
	</div>

	{#if topWords.length > 0}
		<div class="top-words">
			<span class="section-label">Top words</span>
			{#each topWords as { word, count }}
				<div class="word-row">
					<span class="word">{word}</span>
					<div class="bar-track">
						<div class="bar" style="width: {Math.round((count / maxFreq) * 100)}%"></div>
					</div>
					<span class="count">{count}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.stats-panel {
		padding: 0.5rem 0.75rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-surface, #f9fafb);
		font-size: 0.72rem;
		color: var(--color-muted, #6b7280);
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.sep { opacity: 0.35; }

	.stat strong { color: #1f2937; }

	.fk-row { gap: 0.5rem; }
	.fk-hint { font-size: 0.68rem; opacity: 0.6; }

	.top-words {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin-top: 0.15rem;
	}

	.section-label {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.55;
		margin-bottom: 0.1rem;
	}

	.word-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.word { width: 5rem; color: #374151; }

	.bar-track {
		flex: 1;
		height: 6px;
		background: #e5e7eb;
		border-radius: 3px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		background: #7c3aed;
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.count { width: 1.5rem; text-align: right; }
</style>
