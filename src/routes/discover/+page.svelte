<script lang="ts">
	import { onMount } from 'svelte';
	import WriterCard from '$lib/elements/WriterCard.svelte';
	import type { DiscoveryProfile } from '$lib/server/discoveryQueries';
	import { privacyStore } from '$lib/privacyStore.svelte';
	import { goalsStore } from '$lib/writingGoalsStore.svelte';
	import { badgesStore } from '$lib/badgesStore.svelte';

	let profiles = $state<DiscoveryProfile[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let search = $state('');

	const filtered = $derived(
		search.trim()
			? profiles.filter((p) => p.displayName.toLowerCase().includes(search.toLowerCase()))
			: profiles
	);

	onMount(async () => {
		// Submit own profile if opted in
		if (privacyStore.state.showInDiscovery && privacyStore.state.displayName) {
			const earned = badgesStore.earnedBadges;
			const topBadge = earned[earned.length - 1];
			fetch('/api/discover', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					displayName: privacyStore.state.displayName,
					currentStreak: goalsStore.goals.streak,
					longestStreak: goalsStore.goals.longestStreak,
					totalWords: 0,
					topBadgeIcon: topBadge?.icon ?? '✍️',
					topBadgeName: topBadge?.name ?? 'Writer'
				})
			}).catch(() => {});
		}

		try {
			const res = await fetch('/api/discover');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			profiles = data.profiles;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load writers';
		} finally {
			loading = false;
		}
	});
</script>

<div class="discover-page">
	<div class="discover-container">
		<header class="discover-header">
			<div>
				<h1>🔍 Discover Writers</h1>
				<p class="discover-subtitle">Find accountability partners in the community</p>
			</div>
		</header>

		<!-- Search -->
		<div class="search-bar">
			<input
				type="search"
				bind:value={search}
				placeholder="Search by username…"
				aria-label="Search writers"
				class="search-input"
			/>
		</div>

		<!-- Content -->
		{#if error}
			<div class="discover-error" role="alert">⚠️ {error}</div>
		{:else if loading}
			<div class="discover-skeleton">
				{#each Array(6) as _}
					<div class="skeleton-card"></div>
				{/each}
			</div>
		{:else if filtered.length === 0}
			<div class="discover-empty">
				{#if search}
					<p>No writers matching "<strong>{search}</strong>"</p>
				{:else}
					<p>🌱 No writers have opted in yet.</p>
					<p>Enable <strong>"Allow others to discover me"</strong> in <a href="/settings">Settings</a> to be the first!</p>
				{/if}
			</div>
		{:else}
			<p class="result-count">{filtered.length} writer{filtered.length !== 1 ? 's' : ''} found</p>
			<div class="writers-grid">
				{#each filtered as profile (profile.userId)}
					<WriterCard {profile} />
				{/each}
			</div>
		{/if}

		<footer class="discover-footer">
			<p>Only writers who have opted into discovery appear here · <a href="/settings">Privacy settings</a></p>
		</footer>
	</div>
</div>

<style>
	.discover-page {
		min-height: 100vh;
		padding: 2rem 1rem;
		background: var(--color-background, #f9fafb);
	}

	.discover-container {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.discover-header h1 { margin: 0; font-size: 1.75rem; }
	.discover-subtitle { margin: 0.25rem 0 0; color: var(--color-text-secondary, #666); font-size: 0.875rem; }

	.search-input {
		width: 100%;
		padding: 0.65rem 1rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 8px;
		font-size: 0.95rem;
		background: var(--color-surface, #fff);
		color: var(--color-text, #111);
		outline: none;
		transition: border-color 0.15s;
	}

	.search-input:focus { border-color: var(--color-primary, #7c3aed); }

	.result-count { font-size: 0.8rem; color: var(--color-text-secondary, #999); margin: 0; }

	.writers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 0.875rem;
	}

	.discover-skeleton {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 0.875rem;
	}

	.skeleton-card {
		height: 80px;
		border-radius: 10px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.discover-empty, .discover-error {
		text-align: center;
		padding: 3rem 1rem;
		background: var(--color-surface, #fff);
		border-radius: 10px;
		border: 1px solid var(--color-border, #e5e7eb);
		color: var(--color-text-secondary, #666);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.discover-error { border-color: #fca5a5; background: #fef2f2; color: #991b1b; }

	.discover-footer {
		text-align: center;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #aaa);
	}

	.discover-footer a { color: var(--color-primary, #7c3aed); }

	@media (prefers-reduced-motion: reduce) {
		.skeleton-card { animation: none; }
	}
</style>
