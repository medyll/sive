<script lang="ts">
	import { weeklyGoalsStore } from '$lib/weeklyGoalsStore.svelte';
	import { goalsStore } from '$lib/writingGoalsStore.svelte';

	interface Props {
		compact?: boolean;
	}

	let { compact = false }: Props = $props();

	// Derived data
	const perfectWeeks = $derived(weeklyGoalsStore.perfectWeeks);
	const bestWeek = $derived(weeklyGoalsStore.bestWeek);
	const currentWeek = $derived(weeklyGoalsStore.currentWeek);
	const avgWordsPerDay = $derived(weeklyGoalsStore.getAverageWordsPerDay());
	const recentWeeks = $derived(weeklyGoalsStore.getRecentWeeks(4));

	// Format week date range
	function formatWeekRange(weekStart: string): string {
		const start = new Date(weekStart + 'T00:00:00Z');
		const end = new Date(start);
		end.setDate(end.getDate() + 6);

		const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

		return `${startMonth} – ${endMonth}`;
	}

	// Get emoji for completion percentage
	function getCompletionEmoji(completion: number): string {
		if (completion === 1) return '⭐';
		if (completion >= 0.85) return '✨';
		if (completion >= 0.7) return '👍';
		if (completion >= 0.5) return '👌';
		return '📝';
	}

	// Format large numbers with commas
	function formatNumber(n: number): string {
		return n.toLocaleString();
	}
</script>

<div class="weekly-history-panel" class:compact>
	<!-- Perfect weeks badge -->
	{#if !compact}
		<div class="section">
			<h3 class="section-title">Weekly Milestones</h3>
			<div class="milestones-grid">
				<div class="milestone-card">
					<div class="milestone-icon">⭐</div>
					<div class="milestone-label">Perfect Weeks</div>
					<div class="milestone-value">{perfectWeeks}</div>
					<div class="milestone-sublabel">all goals met</div>
				</div>
				<div class="milestone-card">
					<div class="milestone-icon">🏆</div>
					<div class="milestone-label">Best Week</div>
					<div class="milestone-value">
						{#if bestWeek}
							{formatNumber(bestWeek.totalWords)}
						{:else}
							—
						{/if}
					</div>
					<div class="milestone-sublabel">words</div>
				</div>
				<div class="milestone-card">
					<div class="milestone-icon">📊</div>
					<div class="milestone-label">Average</div>
					<div class="milestone-value">{formatNumber(avgWordsPerDay)}</div>
					<div class="milestone-sublabel">words/day</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Recent weeks history -->
	{#if recentWeeks.length > 0}
		<div class="section">
			<h3 class="section-title">Recent Weeks</h3>
			<div class="weeks-list">
				{#each recentWeeks as week, idx}
					<div class="week-item">
						<div class="week-header">
							<span class="week-date">{formatWeekRange(week.weekStart)}</span>
							<span class="week-emoji">{getCompletionEmoji(week.completion)}</span>
						</div>
						<div class="week-stats">
							<span class="stat">
								<span class="stat-label">Total:</span>
								<span class="stat-value">{formatNumber(week.totalWords)} words</span>
							</span>
							<span class="stat">
								<span class="stat-label">Goals:</span>
								<span class="stat-value">{week.daysGoalMet}/7 days</span>
							</span>
						</div>
						<div class="week-bar-bg">
							<div
								class="week-bar-fill"
								style="width: {week.completion * 100}%"
								title="{Math.round(week.completion * 100)}% complete"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="section empty-state">
			<p>Start writing to track weekly progress!</p>
		</div>
	{/if}

	<!-- Current week preview -->
	{#if currentWeek && !compact}
		<div class="section">
			<h3 class="section-title">This Week</h3>
			<div class="current-week">
				<div class="week-progress">
					<span class="progress-label">
						{currentWeek.daysGoalMet} / 7 days
					</span>
					<div class="progress-bar-bg">
						<div
							class="progress-bar-fill"
							style="width: {currentWeek.completion * 100}%"
						></div>
					</div>
				</div>
				<div class="week-details">
					<div class="detail-item">
						<span class="detail-label">Words this week:</span>
						<span class="detail-value">{formatNumber(currentWeek.totalWords)}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">Active days:</span>
						<span class="detail-value">{currentWeek.daysActive} / 7</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.weekly-history-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.weekly-history-panel.compact {
		gap: 1rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.section.empty-state {
		padding: 2rem;
		text-align: center;
		background: var(--color-surface, #f9fafb);
		border-radius: 0.5rem;
	}

	.section.empty-state p {
		margin: 0;
		color: var(--color-text-muted, #6b7280);
	}

	/* Milestones */
	.milestones-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.milestone-card {
		padding: 1rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.milestone-icon {
		font-size: 1.75rem;
	}

	.milestone-label {
		font-size: 0.75rem;
		color: var(--color-text-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.milestone-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
	}

	.milestone-sublabel {
		font-size: 0.7rem;
		color: var(--color-text-muted, #6b7280);
	}

	/* Weeks list */
	.weeks-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.week-item {
		padding: 1rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.week-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.week-date {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text, #1f2937);
	}

	.week-emoji {
		font-size: 1.25rem;
	}

	.week-stats {
		display: flex;
		gap: 1.5rem;
		font-size: 0.85rem;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.stat-label {
		color: var(--color-text-muted, #6b7280);
		font-weight: 500;
	}

	.stat-value {
		color: var(--color-text, #1f2937);
		font-weight: 600;
	}

	.week-bar-bg {
		height: 12px;
		background: var(--color-border, #e5e7eb);
		border-radius: 6px;
		overflow: hidden;
	}

	.week-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
		transition: width 0.3s ease;
		border-radius: 6px;
	}

	/* Current week */
	.current-week {
		padding: 1rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.week-progress {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-label {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.progress-bar-bg {
		height: 20px;
		background: var(--color-border, #e5e7eb);
		border-radius: 10px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
		transition: width 0.3s ease;
		border-radius: 10px;
	}

	.week-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
	}

	.detail-label {
		color: var(--color-text-muted, #6b7280);
		font-weight: 500;
	}

	.detail-value {
		color: var(--color-text, #1f2937);
		font-weight: 600;
	}

	@media (max-width: 600px) {
		.milestones-grid {
			grid-template-columns: 1fr 1fr;
		}

		.week-stats {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
