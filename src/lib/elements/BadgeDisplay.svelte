<script lang="ts">
	import { badgesStore } from '$lib/badgesStore.svelte';
	import { goalsStore } from '$lib/writingGoalsStore.svelte';
	import { streakStore } from '$lib/streakStore.svelte';

	interface Props {
		compact?: boolean;
	}

	let { compact = false }: Props = $props();

	// Calculate total words (estimated from goals data)
	const totalWords = $derived(goalsStore.goals.todayWords);

	// Update badges store with current values
	$effect(() => {
		badgesStore.updateBadges(
			{
				currentStreak: goalsStore.goals.streak,
				longestStreak: goalsStore.goals.longestStreak
			},
			totalWords
		);
	});

	const earned = $derived(badgesStore.earnedBadges);
	const nextStreakBadge = $derived(badgesStore.getNextBadge('streak', goalsStore.goals.longestStreak));
	const nextWordsBadge = $derived(badgesStore.getNextBadge('words', totalWords));
</script>

<div class="badge-display" class:compact>
	<!-- Earned Badges -->
	{#if earned.length > 0}
		<div class="badges-section">
			<h4 class="section-label">Badges Earned</h4>
			<div class="badges-grid" class:compact>
				{#each earned as badge (badge.id)}
					<div class="badge" title="{badge.name}">
						<div class="badge-icon">{badge.icon}</div>
						{#if !compact}
							<div class="badge-name">{badge.name}</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Next Badges -->
	{#if !compact && (nextStreakBadge || nextWordsBadge)}
		<div class="progress-section">
			<h4 class="section-label">Next Badges</h4>
			<div class="progress-list">
				{#if nextStreakBadge}
					<div class="progress-item">
						<span class="progress-label">
							{nextStreakBadge.icon} {nextStreakBadge.name}
						</span>
						<div class="progress-bar-container">
							<div class="progress-bar-bg">
								<div class="progress-bar-fill" style="width: {Math.min(100, (goalsStore.goals.longestStreak / parseInt(nextStreakBadge.id.split('-')[1])) * 100)}%"></div>
							</div>
							<span class="progress-text">
								{goalsStore.goals.longestStreak} / {parseInt(nextStreakBadge.id.split('-')[1])} days
							</span>
						</div>
					</div>
				{/if}

				{#if nextWordsBadge}
					<div class="progress-item">
						<span class="progress-label">
							{nextWordsBadge.icon} {nextWordsBadge.name}
						</span>
						<div class="progress-bar-container">
							<div class="progress-bar-bg">
								<div class="progress-bar-fill" style="width: {Math.min(100, (totalWords / parseInt(nextWordsBadge.id.split('-')[1])) * 100)}%"></div>
							</div>
							<span class="progress-text">
								{totalWords.toLocaleString()} / {parseInt(nextWordsBadge.id.split('-')[1]).toLocaleString()} words
							</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if earned.length === 0 && !nextStreakBadge && !nextWordsBadge}
		<p class="no-badges">🚀 Keep writing to earn badges!</p>
	{/if}
</div>

<style>
	.badge-display {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.badge-display.compact {
		gap: 0.5rem;
	}

	.badges-section,
	.progress-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted, #6b7280);
		opacity: 0.7;
		margin: 0;
		font-weight: 600;
	}

	.badges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
		gap: 0.5rem;
	}

	.badges-grid.compact {
		grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
		gap: 0.25rem;
	}

	.badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		background: color-mix(in srgb, #fbbf24 10%, var(--color-surface, #f9fafb));
		border: 1px solid #fbbf24;
		border-radius: 0.375rem;
		text-align: center;
		cursor: help;
		transition: transform 0.2s;
	}

	.badge:hover {
		transform: scale(1.05);
	}

	.badge-icon {
		font-size: 1.5rem;
	}

	.badge-name {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
		line-height: 1.2;
	}

	.progress-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.progress-item {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.progress-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.progress-bar-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.progress-bar-bg {
		flex: 1;
		height: 8px;
		background: var(--color-border, #e5e7eb);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
		transition: width 0.3s ease;
		border-radius: 4px;
	}

	.progress-text {
		font-size: 0.7rem;
		color: var(--color-muted, #6b7280);
		white-space: nowrap;
		min-width: 70px;
		text-align: right;
	}

	.no-badges {
		color: var(--color-muted, #6b7280);
		font-size: 0.85rem;
		text-align: center;
		padding: 0.5rem;
		margin: 0;
	}
</style>
