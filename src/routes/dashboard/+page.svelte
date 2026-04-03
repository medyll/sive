<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { stats, recentDocs, topDocs } = data;

	// Build 30-day heatmap grid (Mon–Sun columns, newest right)
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const heatmapDays = Array.from({ length: 30 }, (_, i) => {
		const d = new Date(today);
		d.setDate(d.getDate() - (29 - i));
		const key = d.toISOString().slice(0, 10);
		const words = stats.activityByDay[key] ?? 0;
		const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
		return { key, words, label, dayOfWeek: d.getDay() };
	});

	function heatIntensity(words: number): string {
		if (words === 0) return 'heat-0';
		if (words < 100) return 'heat-1';
		if (words < 300) return 'heat-2';
		if (words < 600) return 'heat-3';
		return 'heat-4';
	}

	function formatNumber(n: number): string {
		return n.toLocaleString();
	}

	function relativeDate(ts: number): string {
		if (!ts) return '—';
		const diff = Date.now() - ts;
		const d = Math.floor(diff / 86_400_000);
		if (d === 0) return 'today';
		if (d === 1) return 'yesterday';
		return `${d}d ago`;
	}
</script>

<svelte:head>
	<title>Dashboard — Sive</title>
</svelte:head>

<main class="dashboard">
	<header class="dash-header">
		<h1 class="dash-title">Your Writing Dashboard</h1>
		<a href="/" class="back-link">← Back to editor</a>
	</header>

	<!-- Hero stat cards -->
	<section class="stat-grid" aria-label="Writing statistics">
		<div class="stat-card">
			<span class="stat-value">{formatNumber(stats.totalWords)}</span>
			<span class="stat-label">Total Words</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.totalDocs}</span>
			<span class="stat-label">Documents</span>
		</div>
		<div class="stat-card stat-card--highlight">
			<span class="stat-value">{stats.currentStreak}</span>
			<span class="stat-label">Day Streak 🔥</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{formatNumber(stats.avgWordsPerDoc)}</span>
			<span class="stat-label">Avg Words/Doc</span>
		</div>
	</section>

	<!-- Activity heatmap -->
	<section class="section" aria-label="30-day writing activity">
		<h2 class="section-title">Activity — Last 30 Days</h2>
		<div class="heatmap" role="list">
			{#each heatmapDays as day (day.key)}
				<div
					class="heat-cell {heatIntensity(day.words)}"
					role="listitem"
					title="{day.label}: ~{formatNumber(day.words)} words"
					aria-label="{day.label}, {day.words} words written"
				></div>
			{/each}
		</div>
		<div class="heatmap-legend">
			<span>Less</span>
			<div class="heat-cell heat-0 legend-cell"></div>
			<div class="heat-cell heat-1 legend-cell"></div>
			<div class="heat-cell heat-2 legend-cell"></div>
			<div class="heat-cell heat-3 legend-cell"></div>
			<div class="heat-cell heat-4 legend-cell"></div>
			<span>More</span>
		</div>
	</section>

	<div class="two-col">
		<!-- Top documents by word count -->
		<section class="section" aria-label="Top documents by word count">
			<h2 class="section-title">Top Documents</h2>
			{#if topDocs.length === 0}
				<p class="empty-hint">No documents yet.</p>
			{:else}
				<ol class="doc-list">
					{#each topDocs as doc (doc.id)}
						<li class="doc-item">
							<a href="/" class="doc-link" data-docid={doc.id}>
								<span class="doc-title">{doc.title || 'Untitled'}</span>
								<span class="doc-words">{formatNumber(doc.wordCount)} words</span>
							</a>
						</li>
					{/each}
				</ol>
			{/if}
		</section>

		<!-- Recent activity -->
		<section class="section" aria-label="Recently edited documents">
			<h2 class="section-title">Recently Edited</h2>
			{#if recentDocs.length === 0}
				<p class="empty-hint">No recent activity.</p>
			{:else}
				<ul class="doc-list">
					{#each recentDocs as doc (doc.id)}
						<li class="doc-item">
							<a href="/" class="doc-link" data-docid={doc.id}>
								<span class="doc-title">{doc.title || 'Untitled'}</span>
								<span class="doc-meta">
									{formatNumber(doc.wordCount)} words · {relativeDate(doc.updatedAt)}
								</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>

	<!-- Footer summary -->
	<section class="summary-footer">
		<p>
			Your writing would take
			<strong>{stats.readingTimeMinutes} min</strong> to read ·
			Longest streak: <strong>{stats.longestStreak} days</strong>
			{#if stats.longestDoc}
				· Longest doc: <strong>{stats.longestDoc.title}</strong>
				({formatNumber(stats.longestDoc.words)} words)
			{/if}
		</p>
	</section>
</main>

<style>
	/* ───────────────────────────────────────────────────────────────────────
	   CSS migrated to @medyll/css-base tokens
	   ─────────────────────────────────────────────────────────────────────── */

	.dashboard {
		max-width: 960px;
		margin: 0 auto;
		padding: var(--pad-2xl) var(--pad-lg) var(--pad-3xl);
		font-family: inherit;
	}

	.dash-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: var(--pad-2xl);
		flex-wrap: wrap;
		gap: var(--gap-sm);
	}

	.dash-title {
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--color-text);
	}

	.back-link {
		font-size: var(--text-sm);
		color: var(--color-primary);
		text-decoration: none;
	}

	.back-link:hover { text-decoration: underline; }

	/* Stat grid */
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--gap-md);
		margin-bottom: var(--pad-2xl);
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--pad-lg) var(--pad-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
		gap: var(--gap-xs);
	}

	.stat-card--highlight {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
		border-color: transparent;
		color: var(--color-surface);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--color-text);
		line-height: 1;
	}

	.stat-card--highlight .stat-value { color: var(--color-surface); }

	.stat-label {
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.stat-card--highlight .stat-label { color: rgba(255,255,255,0.8); }

	/* Sections */
	.section {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--pad-lg);
		margin-bottom: var(--gap-md);
	}

	.section-title {
		margin: 0 0 var(--pad-md);
		font-size: var(--text-base);
		font-weight: var(--font-bold);
		color: var(--color-text);
	}

	/* Heatmap */
	.heatmap {
		display: grid;
		grid-template-columns: repeat(30, 1fr);
		gap: 3px;
		margin-bottom: var(--gap-md);
	}

	.heat-cell {
		aspect-ratio: 1;
		border-radius: var(--radius-xs);
	}

	.heat-0 { background: var(--color-surface-alt); }
	.heat-1 { background: color-mix(in oklch, var(--color-primary) 20%, transparent); }
	.heat-2 { background: color-mix(in oklch, var(--color-primary) 50%, transparent); }
	.heat-3 { background: color-mix(in oklch, var(--color-primary) 75%, transparent); }
	.heat-4 { background: var(--color-primary); }

	.heatmap-legend {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		justify-content: flex-end;
	}

	.legend-cell {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	/* Two column layout */
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--gap-md);
		margin-bottom: var(--gap-md);
	}

	/* Doc lists */
	.doc-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--gap-xs);
	}

	.doc-item { border-radius: var(--radius-md); }

	.doc-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--gap-md);
		padding: var(--pad-sm) var(--pad-md);
		text-decoration: none;
		border-radius: var(--radius-md);
		transition: background-color var(--transition-fast);
	}

	.doc-link:hover { background: var(--color-surface-hover); }

	.doc-title {
		font-size: var(--text-sm);
		color: var(--color-text);
		font-weight: var(--font-medium);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.doc-words, .doc-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.empty-hint {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Footer summary */
	.summary-footer {
		padding: var(--pad-md) var(--pad-lg);
		background: var(--color-surface-alt);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-align: center;
	}

	.summary-footer strong { color: var(--color-text); }

	/* Responsive */
	@media (max-width: 720px) {
		.stat-grid { grid-template-columns: repeat(2, 1fr); }
		.two-col { grid-template-columns: 1fr; }
		.heatmap { grid-template-columns: repeat(15, 1fr); }
	}

	@media (max-width: 420px) {
		.stat-grid { grid-template-columns: repeat(2, 1fr); }
		.heatmap { grid-template-columns: repeat(10, 1fr); }
	}
</style>
