<script lang="ts">
	import { userProfileStore } from '$lib/userProfileStore.svelte';
	import { goalsStore } from '$lib/writingGoalsStore.svelte';
	import { streakStore } from '$lib/streakStore.svelte';
	import { weeklyGoalsStore } from '$lib/weeklyGoalsStore.svelte';
	import { badgesStore } from '$lib/badgesStore.svelte';

	interface Props {
		editable?: boolean;
		onEditClick?: () => void;
	}

	let { editable = false, onEditClick }: Props = $props();

	// Derived data
	const profile = $derived(userProfileStore.profile);
	const currentStreak = $derived(goalsStore.goals.streak);
	const longestStreak = $derived(goalsStore.goals.longestStreak);
	const totalWords = $derived(goalsStore.goals.todayWords); // TODO: should be cumulative from all sessions
	const earnedBadges = $derived(badgesStore.getEarnedBadges());
	const weeklyHistory = $derived(weeklyGoalsStore.history);

	// Calculate total words across all weeks
	const cumulativeWords = $derived(
		weeklyHistory.reduce((sum, week) => sum + week.totalWords, 0) + totalWords
	);

	function formatNumber(n: number): string {
		return n.toLocaleString();
	}
</script>

<div class="profile-card">
	<!-- Profile header -->
	<div class="profile-header">
		<div class="profile-avatar">
			<span class="avatar-emoji">✍️</span>
		</div>
		<div class="profile-info">
			<h1 class="profile-name">{profile.name}</h1>
			{#if profile.bio}
				<p class="profile-bio">{profile.bio}</p>
			{/if}
			{#if profile.username}
				<p class="profile-username">@{profile.username}</p>
			{/if}
		</div>
		{#if editable}
			<button
				type="button"
				class="btn-edit"
				onclick={onEditClick}
				aria-label="Edit profile"
				title="Edit profile"
			>
				✏️
			</button>
		{/if}
	</div>

	<!-- Visibility badge -->
	<div class="visibility-badge" class:public={userProfileStore.isPublic}>
		{userProfileStore.isPublic ? '🌍 Public' : '🔒 Private'}
	</div>

	<!-- Stats grid -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">🔥</div>
			<div class="stat-label">Current Streak</div>
			<div class="stat-value">{currentStreak}</div>
			<div class="stat-sublabel">days</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">⭐</div>
			<div class="stat-label">Longest Streak</div>
			<div class="stat-value">{longestStreak}</div>
			<div class="stat-sublabel">all time</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">📝</div>
			<div class="stat-label">Total Words</div>
			<div class="stat-value">{formatNumber(cumulativeWords)}</div>
			<div class="stat-sublabel">written</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🏆</div>
			<div class="stat-label">Badges Earned</div>
			<div class="stat-value">{earnedBadges.length}</div>
			<div class="stat-sublabel">achievements</div>
		</div>
	</div>

	<!-- Earned badges display -->
	{#if earnedBadges.length > 0}
		<div class="badges-section">
			<h3 class="section-title">Achievements</h3>
			<div class="badges-grid">
				{#each earnedBadges as badge}
					<div
						class="badge-item"
						title={badge.name}
						aria-label={badge.name}
					>
						<span class="badge-icon">{badge.icon}</span>
						<span class="badge-name">{badge.name}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Activity summary -->
	{#if weeklyHistory.length > 0}
		<div class="activity-section">
			<h3 class="section-title">Activity</h3>
			<div class="activity-stats">
				<div class="activity-stat">
					<span class="activity-label">Weeks Active</span>
					<span class="activity-value">{weeklyHistory.length}</span>
				</div>
				<div class="activity-stat">
					<span class="activity-label">Perfect Weeks</span>
					<span class="activity-value">{weeklyGoalsStore.perfectWeeks}</span>
				</div>
				<div class="activity-stat">
					<span class="activity-label">Avg Words/Day</span>
					<span class="activity-value">{formatNumber(weeklyGoalsStore.getAverageWordsPerDay())}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.profile-card {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		background: var(--color-background, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.75rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	/* Profile header */
	.profile-header {
		display: flex;
		gap: 1.5rem;
		align-items: flex-start;
		position: relative;
	}

	.profile-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: var(--color-surface, #f9fafb);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.avatar-emoji {
		font-size: 2.5rem;
	}

	.profile-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}

	.profile-name {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
	}

	.profile-bio {
		margin: 0;
		font-size: 0.95rem;
		color: var(--color-text-muted, #6b7280);
		line-height: 1.5;
	}

	.profile-username {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-primary, #3b82f6);
		font-weight: 500;
	}

	.btn-edit {
		position: absolute;
		top: 0;
		right: 0;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.2s;
	}

	.btn-edit:hover {
		background: var(--color-surface, #f9fafb);
	}

	/* Visibility badge */
	.visibility-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #fee2e2;
		color: #991b1b;
		border-radius: 9999px;
		font-size: 0.85rem;
		font-weight: 600;
		width: fit-content;
	}

	.visibility-badge.public {
		background: #dcfce7;
		color: #166534;
	}

	/* Stats grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		padding: 1.25rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-icon {
		font-size: 2rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
	}

	.stat-sublabel {
		font-size: 0.7rem;
		color: var(--color-text-muted, #6b7280);
	}

	/* Badges section */
	.badges-section,
	.activity-section {
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

	.badges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 0.75rem;
	}

	.badge-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 0.75rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.375rem;
		text-align: center;
		cursor: default;
	}

	.badge-icon {
		font-size: 1.5rem;
	}

	.badge-name {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--color-text, #1f2937);
		line-height: 1.2;
	}

	/* Activity stats */
	.activity-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.activity-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--color-surface, #f9fafb);
		border-radius: 0.375rem;
	}

	.activity-label {
		font-size: 0.75rem;
		color: var(--color-text-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.activity-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
	}

	@media (max-width: 600px) {
		.profile-card {
			padding: 1.5rem;
			gap: 1rem;
		}

		.profile-header {
			gap: 1rem;
		}

		.profile-avatar {
			width: 60px;
			height: 60px;
		}

		.avatar-emoji {
			font-size: 2rem;
		}

		.profile-name {
			font-size: 1.5rem;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.badges-grid {
			grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
		}

		.activity-stats {
			grid-template-columns: 1fr;
		}
	}
</style>
