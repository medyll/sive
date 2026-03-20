<script lang="ts">
	import { goalsStore } from '$lib/writingGoalsStore.svelte';

	interface Props {
		currentWordCount?: number;
	}

	let { currentWordCount = 0 }: Props = $props();

	$effect(() => {
		if (currentWordCount > 0) goalsStore.recordWords(currentWordCount);
	});

	let editing = $state(false);
	let targetDraft = $state(String(goalsStore.goals.dailyTarget));

	function saveTarget() {
		const n = parseInt(targetDraft, 10);
		if (!isNaN(n) && n > 0) goalsStore.setDailyTarget(n);
		editing = false;
	}

	const pct = $derived(Math.round(goalsStore.progress * 100));
</script>

<div class={['goal-bar', goalsStore.goalMet && 'met'].filter(Boolean).join(' ')}>
	<div class="goal-track">
		<div class="goal-fill" style="width:{pct}%"></div>
	</div>
	<div class="goal-info">
		{#if goalsStore.goalMet}
			<span class="goal-met">🎉 Goal met! {goalsStore.goals.todayWords} words</span>
		{:else}
			<span class="goal-remaining">{goalsStore.remaining} words to go</span>
		{/if}

		{#if goalsStore.goals.streak > 0}
			<span class="streak">🔥 {goalsStore.goals.streak}d streak</span>
		{/if}

		{#if editing}
			<div class="target-edit">
				<input
					type="number"
					bind:value={targetDraft}
					min="1"
					max="100000"
					onkeydown={(e) => { if (e.key === 'Enter') saveTarget(); if (e.key === 'Escape') editing = false; }}
				/>
				<button onclick={saveTarget}>✓</button>
			</div>
		{:else}
			<button class="target-btn" onclick={() => { editing = true; targetDraft = String(goalsStore.goals.dailyTarget); }}>
				Goal: {goalsStore.goals.dailyTarget}w
			</button>
		{/if}
	</div>
</div>

<style>
	.goal-bar { padding: 0.4rem 0.75rem; border-top: 1px solid var(--border, #e5e7eb); }
	.goal-track { height: 4px; background: var(--border, #e5e7eb); border-radius: 2px; overflow: hidden; margin-bottom: 0.35rem; }
	.goal-fill { height: 100%; background: var(--accent, #7c3aed); border-radius: 2px; transition: width 0.4s ease; }
	.met .goal-fill { background: #10b981; }
	.goal-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: var(--muted, #9ca3af); flex-wrap: wrap; }
	.goal-met { color: #10b981; font-weight: 600; }
	.streak { color: #f59e0b; font-weight: 600; }
	.target-btn { background: none; border: none; cursor: pointer; font-size: 0.72rem; color: var(--muted, #9ca3af); padding: 0; text-decoration: underline dotted; }
	.target-edit { display: flex; gap: 0.25rem; align-items: center; }
	.target-edit input { width: 60px; font-size: 0.72rem; padding: 0.15rem 0.3rem; border: 1px solid var(--border, #e5e7eb); border-radius: 4px; }
	.target-edit button { background: none; border: none; cursor: pointer; color: var(--accent, #7c3aed); font-size: 0.8rem; }
</style>
