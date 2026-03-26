<script lang="ts">
	import { challengeStore } from '$lib/challengeStore.svelte';
	import type { Challenge } from '$lib/challengeStore.svelte';

	export let challenge: Challenge;

	$: joined = challengeStore.isJoined(challenge.id);
	$: progress = challengeStore.getProgress(challenge.id);
	$: pct = progress && challenge.targetWords > 0
		? Math.min(100, Math.round((progress.wordsContributed / challenge.targetWords) * 100))
		: 0;

	$: daysLeft = Math.max(0, Math.ceil(
		(new Date(challenge.endsAt).getTime() - Date.now()) / 86_400_000
	));

	function toggle() {
		if (joined) {
			challengeStore.leave(challenge.id);
		} else {
			challengeStore.join(challenge.id);
		}
	}
</script>

<div class="challenge-card" class:joined>
	<div class="card-header">
		<h3 class="card-title">{challenge.title}</h3>
		<span class="days-left">{daysLeft}d left</span>
	</div>

	{#if challenge.description}
		<p class="card-desc">{challenge.description}</p>
	{/if}

	<div class="card-meta">
		<span>🎯 {challenge.targetWords.toLocaleString()} words</span>
		<span>📅 {challenge.durationDays} days</span>
	</div>

	{#if joined && progress}
		<div class="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
			<div class="progress-fill" style="width: {pct}%"></div>
		</div>
		<p class="progress-label">{progress.wordsContributed.toLocaleString()} / {challenge.targetWords.toLocaleString()} words ({pct}%)</p>
	{/if}

	<button
		type="button"
		class={['btn-join', joined && 'btn-join--leave'].filter(Boolean).join(' ')}
		onclick={toggle}
	>
		{joined ? '✓ Joined' : '+ Join Challenge'}
	</button>
</div>

<style>
	.challenge-card {
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 12px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		transition: box-shadow 0.15s, border-color 0.15s;
	}

	.challenge-card:hover {
		border-color: var(--color-primary, #7c3aed);
		box-shadow: 0 2px 10px rgba(124, 58, 237, 0.08);
	}

	.challenge-card.joined {
		border-color: var(--color-primary, #7c3aed);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.card-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text, #111);
	}

	.days-left {
		font-size: 0.75rem;
		color: var(--color-text-secondary, #999);
		white-space: nowrap;
	}

	.card-desc {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-text-secondary, #666);
		line-height: 1.5;
	}

	.card-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		color: var(--color-text-secondary, #666);
	}

	.progress-bar {
		height: 6px;
		background: var(--color-border, #e5e7eb);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary, #7c3aed);
		border-radius: 3px;
		transition: width 0.3s;
	}

	.progress-label {
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #777);
	}

	.btn-join {
		align-self: flex-start;
		padding: 0.4rem 1rem;
		border: 1px solid var(--color-primary, #7c3aed);
		border-radius: 20px;
		background: transparent;
		color: var(--color-primary, #7c3aed);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-join:hover { background: var(--color-primary, #7c3aed); color: white; }

	.btn-join--leave {
		background: var(--color-primary, #7c3aed);
		color: white;
	}

	.btn-join--leave:hover {
		background: transparent;
		color: var(--color-primary, #7c3aed);
	}
</style>
