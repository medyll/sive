<script lang="ts">
	import { partnerFeedStore, type FeedGroup } from '$lib/partnerFeedStore.svelte';
	import { onMount } from 'svelte';

	export let limit = 50;

	let groups: FeedGroup[] = [];

	onMount(() => {
		groups = partnerFeedStore.getGroupedFeed(limit);
		partnerFeedStore.markRead();
	});
</script>

<div class="feed">
	{#if groups.length === 0}
		<div class="feed-empty">
			<p class="feed-empty-icon">🤝</p>
			<h3>No activity yet</h3>
			<p>When your accountability partners earn badges, hit streaks, or reach the leaderboard, you'll see it here.</p>
			<a href="/settings" class="btn-link">Find partners →</a>
		</div>
	{:else}
		{#each groups as group (group.label)}
			<section class="feed-group">
				<h3 class="feed-day-label">{group.label}</h3>
				<ul class="feed-list">
					{#each group.events as event (event.id)}
						<li class="feed-item">
							<span class="feed-text">{partnerFeedStore.typeLabel(event)}</span>
							<time class="feed-time" datetime={new Date(event.timestamp).toISOString()}>
								{new Date(event.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
							</time>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</div>

<style>
	.feed { display: flex; flex-direction: column; gap: 1.5rem; }

	.feed-empty {
		text-align: center;
		padding: 2.5rem 1rem;
		color: var(--color-text-secondary, #666);
	}

	.feed-empty-icon { font-size: 2.5rem; margin: 0 0 0.5rem; }
	.feed-empty h3 { margin: 0 0 0.5rem; font-size: 1rem; color: var(--color-text, #333); }
	.feed-empty p { margin: 0 0 1rem; font-size: 0.875rem; }

	.btn-link {
		color: var(--color-primary, #7c3aed);
		font-weight: 600;
		text-decoration: none;
	}

	.feed-day-label {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-text-secondary, #999);
	}

	.feed-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.feed-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding: 0.65rem 0.875rem;
		background: var(--color-surface, #fff);
		border-radius: 8px;
		border: 1px solid var(--color-border, #eee);
		font-size: 0.9rem;
	}

	.feed-text { flex: 1; color: var(--color-text, #222); }

	.feed-time {
		font-size: 0.75rem;
		color: var(--color-text-secondary, #aaa);
		white-space: nowrap;
		flex-shrink: 0;
	}
</style>
