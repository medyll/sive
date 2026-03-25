<script lang="ts">
	import { goalsStore } from '$lib/writingGoalsStore.svelte';
	import { streakStore } from '$lib/streakStore.svelte';
	import ShareGoalsModal from './ShareGoalsModal.svelte';

	interface Props {
		compact?: boolean;
	}

	let { compact = false }: Props = $props();
	let showShareModal = $state(false);

	// Derived data
	const dailyProgress = $derived(goalsStore.progress);
	const goalMetToday = $derived(goalsStore.goalMet);
	const remaining = $derived(goalsStore.remaining);

	const currentStreak = $derived(goalsStore.goals.streak);
	const longestStreak = $derived(goalsStore.goals.longestStreak);
	const isActiveToday = $derived(streakStore.isActiveToday);

	// Activity window for the last 7 days
	const weekActivity = $derived(streakStore.getActivityWindow(7));
	const weekDays = $derived.by(() => {
		const days: { date: string; label: string; count: number }[] = [];
		const now = new Date();
		for (let i = 6; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().slice(0, 10);
			const shortDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
			days.push({
				date: dateStr,
				label: shortDay,
				count: weekActivity[dateStr] ?? 0
			});
		}
		return days;
	});

	// Color coding for activity intensity
	function getActivityColor(count: number): string {
		if (count === 0) return 'var(--color-border, #e5e7eb)';
		if (count < 3) return '#dbeafe';    // light blue
		if (count < 6) return '#93c5fd';    // medium blue
		if (count < 10) return '#3b82f6';   // blue
		return '#1e40af';                   // dark blue
	}

	function formatGoal(num: number): string {
		return num.toLocaleString();
	}
</script>

<div class="goals-dashboard" class:compact>
	<!-- Progress bar -->
	<div class="section">
		<div class="section-header">
			<h3 class="section-title">Daily Goal</h3>
			<span class="goal-status" class:met={goalMetToday}>
				{goalsStore.goals.todayWords} / {goalsStore.goals.dailyTarget} words
			</span>
		</div>
		<div class="progress-bar-container">
			<div class="progress-bar-bg">
				<div
					class="progress-bar-fill"
					style="width: {dailyProgress * 100}%"
				></div>
			</div>
			{#if remaining > 0}
				<p class="remaining-text">{remaining} more words to reach goal</p>
			{:else}
				<p class="remaining-text goal-met">🎉 Goal met!</p>
			{/if}
		</div>
	</div>

	<!-- Streaks + Share button -->
	<div class="section">
		<div class="section-header">
			<h3 class="section-title">Streaks</h3>
			{#if !compact}
				<button
					type="button"
					class="btn-share"
					onclick={() => (showShareModal = true)}
					title="Share your goals and streaks"
					aria-label="Share goals and streaks"
				>
					📤 Share
				</button>
			{/if}
		</div>
		<div class="streak-grid">
			<div class="streak-card">
				<div class="streak-value">🔥 {currentStreak}</div>
				<div class="streak-label">Current</div>
				<div class="streak-sublabel">day streak</div>
			</div>
			<div class="streak-card">
				<div class="streak-value">⭐ {longestStreak}</div>
				<div class="streak-label">Longest</div>
				<div class="streak-sublabel">all time</div>
			</div>
		</div>
		{#if !isActiveToday}
			<div class="inactive-notice">Write today to maintain your streak!</div>
		{/if}
	</div>

	<!-- Activity heatmap (last 7 days) -->
	{#if !compact}
		<div class="section">
			<h4 class="section-title">This Week</h4>
			<div class="activity-grid">
				{#each weekDays as { date, label, count }}
					<div
						class="activity-cell"
						title="{label} {count} session{count !== 1 ? 's' : ''}"
						style="background-color: {getActivityColor(count)}"
					>
						<span class="day-label">{label}</span>
						<span class="activity-count">{count}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Stats summary -->
	{#if !compact}
		<div class="section stats-summary">
			<h4 class="section-title">Statistics</h4>
			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-label">Today</span>
					<span class="stat-value">{streakStore.dailyActivityCount}</span>
					<span class="stat-unit">session{streakStore.dailyActivityCount !== 1 ? 's' : ''}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">This Week</span>
					<span class="stat-value">{Object.values(weekActivity).reduce((a, b) => a + b, 0)}</span>
					<span class="stat-unit">sessions</span>
				</div>
			</div>
		</div>
	{/if}
</div>

{#if showShareModal}
	<ShareGoalsModal onClose={() => (showShareModal = false)} />
{/if}

<style>
	.goals-dashboard {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.5rem;
		background: var(--color-surface, #f9fafb);
		border-radius: 0.5rem;
		border: 1px solid var(--color-border, #e5e7eb);
	}

	.goals-dashboard.compact {
		gap: 1rem;
		padding: 1rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.section-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
		margin: 0;
	}

	.goal-status {
		font-size: 0.85rem;
		color: var(--color-muted, #6b7280);
	}

	.goal-status.met {
		color: #16a34a;
		font-weight: 600;
	}

	/* Progress bar */
	.progress-bar-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-bar-bg {
		height: 24px;
		background: var(--color-border, #e5e7eb);
		border-radius: 12px;
		overflow: hidden;
		position: relative;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
		transition: width 0.4s ease;
		border-radius: 12px;
	}

	.remaining-text {
		font-size: 0.8rem;
		color: var(--color-muted, #6b7280);
		margin: 0;
	}

	.remaining-text.goal-met {
		color: #16a34a;
		font-weight: 600;
	}

	/* Streaks */
	.streak-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.streak-card {
		padding: 1rem;
		background: var(--color-base, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.375rem;
		text-align: center;
	}

	.streak-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin-bottom: 0.25rem;
	}

	.streak-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.streak-sublabel {
		font-size: 0.7rem;
		color: var(--color-muted, #6b7280);
	}

	.inactive-notice {
		padding: 0.5rem 0.75rem;
		background: #fef3c7;
		border-left: 3px solid #f59e0b;
		font-size: 0.8rem;
		color: #92400e;
		border-radius: 0.25rem;
	}

	/* Activity heatmap */
	.activity-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
	}

	.activity-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		min-height: 3.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text, #1f2937);
	}

	.activity-cell:hover {
		transform: scale(1.05);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.day-label {
		opacity: 0.8;
		font-size: 0.7rem;
		margin-bottom: 0.2rem;
	}

	.activity-count {
		font-weight: 600;
	}

	/* Stats */
	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem;
		background: var(--color-base, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.375rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0.25rem 0;
	}

	.stat-unit {
		font-size: 0.7rem;
		color: var(--color-muted, #6b7280);
	}

	/* Share button */
	.btn-share {
		padding: 0.5rem 1rem;
		background: var(--color-accent, #7c3aed);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
		white-space: nowrap;
	}

	.btn-share:hover {
		background: #6d28d9;
	}
</style>
