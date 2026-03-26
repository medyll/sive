<script lang="ts">
	import { onMount } from 'svelte';
	import { leaderboardStore, type LeaderboardEntry } from '$lib/leaderboardStore.svelte';
	import { privacyStore } from '$lib/privacyStore.svelte';
	import { toastStore } from '$lib/toastStore.svelte';

	type Tab = 'weekly' | 'alltime-streak' | 'alltime-words' | 'myrank';
	let activeTab = $state<Tab>('weekly');
	let alltimeView = $state<'streak' | 'words'>('streak');

	const medals = ['🥇', '🥈', '🥉'];

	onMount(() => {
		leaderboardStore.fetchWeekly();
		leaderboardStore.fetchAlltime('streak');
	});

	$: state = leaderboardStore.state;
	$: cacheAge = leaderboardStore.cacheAge;
	$: privacy = privacyStore.state;

	$: entries = activeTab === 'weekly'
		? state.weekly.entries
		: activeTab === 'alltime-streak'
			? state.alltime.streak.entries
			: state.alltime.words.entries;

	$: loading = activeTab === 'weekly' ? state.weekly.loading : state.alltime.loading;

	function switchTab(tab: Tab) {
		activeTab = tab;
		if (tab === 'alltime-streak') leaderboardStore.fetchAlltime('streak');
		if (tab === 'alltime-words') leaderboardStore.fetchAlltime('words');
	}

	function handleRefresh() {
		if (activeTab === 'weekly') leaderboardStore.fetchWeekly(true);
		else leaderboardStore.fetchAlltime(activeTab === 'alltime-words' ? 'words' : 'streak', true);
	}

	function toggleLeaderboardVisibility() {
		const next = !privacy.showOnLeaderboard;
		privacyStore.setLeaderboardVisibility(next);
		toastStore.success(next ? 'You are now visible on the leaderboard' : 'Hidden from leaderboard');
	}
</script>

<div class="leaderboard-page">
	<div class="leaderboard-container">

		<!-- Header -->
		<header class="lb-header">
			<div>
				<h1>📊 Leaderboard</h1>
				<p class="lb-subtitle">Community writing rankings</p>
			</div>
			<div class="lb-actions">
				{#if cacheAge !== null}
					<span class="cache-label">Updated {cacheAge}m ago</span>
				{/if}
				<button
					type="button"
					class="btn-refresh"
					onclick={handleRefresh}
					disabled={loading}
					aria-label="Refresh"
				>{loading ? '⏳' : '🔄'}</button>
			</div>
		</header>

		<!-- Privacy toggle -->
		<div class="privacy-bar">
			<label class="privacy-toggle" for="lb-visible">
				<input
					id="lb-visible"
					type="checkbox"
					checked={privacy.showOnLeaderboard}
					onchange={toggleLeaderboardVisibility}
				/>
				<span>Show me on leaderboard</span>
			</label>
			{#if !privacy.showOnLeaderboard}
				<span class="privacy-note">🔒 You are anonymous by default</span>
			{/if}
		</div>

		<!-- Tabs -->
		<nav class="lb-tabs" role="tablist" aria-label="Leaderboard views">
			{#each [
				{ id: 'weekly', label: 'This Week' },
				{ id: 'alltime-streak', label: '🔥 Best Streak' },
				{ id: 'alltime-words', label: '✍️ Most Words' },
				{ id: 'myrank', label: 'My Rank' }
			] as tab (tab.id)}
				<button
					type="button"
					role="tab"
					aria-selected={activeTab === tab.id}
					class={['lb-tab', activeTab === tab.id && 'lb-tab--active'].filter(Boolean).join(' ')}
					onclick={() => switchTab(tab.id as Tab)}
				>{tab.label}</button>
			{/each}
		</nav>

		<!-- Content -->
		{#if activeTab === 'myrank'}
			<div class="myrank-panel">
				<h2>Your Rankings</h2>
				{#if state.weekly.userRank}
					<div class="rank-card">
						<span class="rank-icon">📅</span>
						<div>
							<strong>This Week</strong>
							<p>#{state.weekly.userRank.rank} of {state.weekly.userRank.total}</p>
						</div>
					</div>
				{/if}
				{#if state.alltime.userRank}
					<div class="rank-card">
						<span class="rank-icon">🔥</span>
						<div>
							<strong>Best Streak</strong>
							<p>#{state.alltime.userRank.streakRank} of {state.alltime.userRank.total}</p>
						</div>
					</div>
					<div class="rank-card">
						<span class="rank-icon">✍️</span>
						<div>
							<strong>Total Words</strong>
							<p>#{state.alltime.userRank.wordsRank} of {state.alltime.userRank.total}</p>
						</div>
					</div>
				{/if}
				{#if !state.weekly.userRank && !state.alltime.userRank}
					<div class="lb-empty">
						<p>You haven't submitted stats yet.</p>
						<p>Enable "Show me on leaderboard" above to appear in rankings.</p>
					</div>
				{/if}
			</div>
		{:else if loading && entries.length === 0}
			<div class="lb-skeleton" aria-busy="true" aria-label="Loading…">
				{#each Array(5) as _}<div class="skeleton-row"></div>{/each}
			</div>
		{:else if entries.length === 0}
			<div class="lb-empty">
				<p>🌱 No entries yet. Enable leaderboard visibility above to be the first!</p>
			</div>
		{:else}
			<ol class="lb-list" aria-label="Leaderboard">
				{#each entries as entry (entry.userId)}
					<li class={['lb-row', entry.rank <= 3 && 'lb-row--top'].filter(Boolean).join(' ')}>
						<span class="lb-rank">{entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}</span>
						<span class="lb-name">{entry.displayName}</span>
						{#if activeTab === 'weekly'}
							<span class="lb-stat">{entry.weeklyWords.toLocaleString()} words</span>
						{:else if activeTab === 'alltime-streak'}
							<span class="lb-stat">🔥 {entry.currentStreak}d streak</span>
						{:else}
							<span class="lb-stat">{entry.totalWords.toLocaleString()} total</span>
						{/if}
					</li>
				{/each}
			</ol>
		{/if}

		<footer class="lb-footer">
			<p>Weekly rankings reset every Monday · <a href="/settings">Settings</a></p>
		</footer>
	</div>
</div>

<style>
	.leaderboard-page {
		min-height: 100vh;
		padding: 2rem 1rem;
		background: var(--color-background, #f9fafb);
	}

	.leaderboard-container {
		max-width: 680px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.lb-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.lb-header h1 { margin: 0; font-size: 1.75rem; }
	.lb-subtitle { margin: 0.2rem 0 0; color: var(--color-text-secondary, #666); font-size: 0.875rem; }

	.lb-actions { display: flex; align-items: center; gap: 0.5rem; }

	.cache-label { font-size: 0.75rem; color: var(--color-text-secondary, #999); }

	.btn-refresh {
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 6px;
		background: var(--color-surface, #fff);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
	}

	.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

	/* Privacy bar */
	.privacy-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		font-size: 0.875rem;
	}

	.privacy-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: 500;
	}

	.privacy-note { color: var(--color-text-secondary, #999); }

	/* Tabs */
	.lb-tabs {
		display: flex;
		gap: 0.25rem;
		overflow-x: auto;
		padding-bottom: 2px;
	}

	.lb-tab {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px 6px 0 0;
		background: var(--color-surface, #f0f0f0);
		color: var(--color-text-secondary, #555);
		cursor: pointer;
		white-space: nowrap;
		font-size: 0.875rem;
		transition: background 0.15s, color 0.15s;
	}

	.lb-tab--active {
		background: var(--color-primary, #7c3aed);
		color: white;
		font-weight: 600;
	}

	/* List */
	.lb-list {
		list-style: none;
		margin: 0;
		padding: 0;
		background: var(--color-surface, #fff);
		border-radius: 0 8px 8px 8px;
		border: 1px solid var(--color-border, #e5e7eb);
		overflow: hidden;
	}

	.lb-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.8rem 1.25rem;
		border-bottom: 1px solid var(--color-border, #f0f0f0);
	}

	.lb-row:last-child { border-bottom: none; }
	.lb-row--top { background: rgba(255,215,0,0.05); }

	.lb-rank { width: 2rem; text-align: center; font-size: 1.1rem; font-weight: 700; flex-shrink: 0; }
	.lb-name { flex: 1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.lb-stat { font-weight: 700; color: var(--color-primary, #7c3aed); font-size: 0.9rem; white-space: nowrap; }

	/* My Rank panel */
	.myrank-panel {
		background: var(--color-surface, #fff);
		border-radius: 0 8px 8px 8px;
		border: 1px solid var(--color-border, #e5e7eb);
		padding: 1.5rem;
	}

	.myrank-panel h2 { margin: 0 0 1rem; font-size: 1.1rem; }

	.rank-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		border: 1px solid var(--color-border, #f0f0f0);
		border-radius: 8px;
		margin-bottom: 0.75rem;
	}

	.rank-icon { font-size: 1.75rem; }
	.rank-card strong { display: block; font-size: 0.8rem; color: var(--color-text-secondary, #666); text-transform: uppercase; }
	.rank-card p { margin: 0.1rem 0 0; font-size: 1.25rem; font-weight: 700; }

	/* Skeleton */
	.lb-skeleton { display: flex; flex-direction: column; gap: 0.5rem; }

	.skeleton-row {
		height: 50px;
		border-radius: 6px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.lb-empty {
		text-align: center;
		padding: 2.5rem 1rem;
		background: var(--color-surface, #fff);
		border-radius: 0 8px 8px 8px;
		border: 1px solid var(--color-border, #e5e7eb);
		color: var(--color-text-secondary, #666);
		font-size: 0.9rem;
	}

	.lb-footer {
		text-align: center;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #aaa);
	}

	.lb-footer a { color: var(--color-primary, #7c3aed); }

	@media (prefers-reduced-motion: reduce) {
		.skeleton-row { animation: none; }
	}
</style>
