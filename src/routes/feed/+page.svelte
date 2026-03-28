<script lang="ts">
	import PartnerActivityFeed from '$lib/elements/PartnerActivityFeed.svelte';
	import { partnerFeedStore } from '$lib/partnerFeedStore.svelte';

	type Filter = 'all' | 'badge_earned' | 'streak_milestone' | 'leaderboard_entry' | 'goal_completed';
	let filter = $state<Filter>('all');

	const filters: { id: Filter; label: string }[] = [
		{ id: 'all',               label: 'All' },
		{ id: 'badge_earned',      label: '🏆 Badges' },
		{ id: 'streak_milestone',  label: '🔥 Streaks' },
		{ id: 'leaderboard_entry', label: '📊 Leaderboard' },
		{ id: 'goal_completed',    label: '✅ Goals' }
	];
</script>

<div class="feed-page">
	<div class="feed-container">
		<header class="feed-header">
			<h1>🌊 Activity Feed</h1>
			<p class="feed-subtitle">Your accountability partners' recent wins</p>
		</header>

		<!-- Filters -->
		<div class="feed-filters" role="tablist" aria-label="Filter activity">
			{#each filters as f (f.id)}
				<button
					type="button"
					role="tab"
					aria-selected={filter === f.id}
					class={['filter-btn', filter === f.id && 'filter-btn--active'].filter(Boolean).join(' ')}
					onclick={() => (filter = f.id)}
				>{f.label}</button>
			{/each}
		</div>

		<PartnerActivityFeed limit={50} />

		<footer class="feed-footer">
			<a href="/settings">Manage partners</a> · <a href="/leaderboard">View leaderboard</a>
		</footer>
	</div>
</div>

<style>
	.feed-page {
		min-height: 100vh;
		padding: 2rem 1rem;
		background: var(--color-background, #f9fafb);
	}

	.feed-container {
		max-width: 640px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.feed-header h1 { margin: 0; font-size: 1.75rem; }
	.feed-subtitle { margin: 0.25rem 0 0; color: var(--color-text-secondary, #666); font-size: 0.875rem; }

	.feed-filters {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.filter-btn {
		padding: 0.375rem 0.875rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 20px;
		background: var(--color-surface, #fff);
		color: var(--color-text-secondary, #555);
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 500;
		transition: all 0.15s;
	}

	.filter-btn--active {
		background: var(--color-primary, #7c3aed);
		border-color: var(--color-primary, #7c3aed);
		color: white;
	}

	.feed-footer {
		text-align: center;
		font-size: 0.8rem;
		color: var(--color-text-secondary, #aaa);
	}

	.feed-footer a { color: var(--color-primary, #7c3aed); }
</style>
