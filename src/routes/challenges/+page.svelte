<script lang="ts">
	import { challengeStore } from '$lib/challengeStore.svelte';
	import ChallengeCard from '$lib/elements/ChallengeCard.svelte';

	let showCreate = $state(false);
	let title = $state('');
	let description = $state('');
	let targetWords = $state(10000);
	let durationDays = $state(30);
	let tab = $state<'active' | 'joined'>('active');

	const active = $derived(challengeStore.getActive());
	const joined = $derived(active.filter((c) => challengeStore.isJoined(c.id)));
	const displayed = $derived(tab === 'joined' ? joined : active);

	function submit() {
		if (!title.trim()) return;
		challengeStore.createChallenge(title, description, targetWords, durationDays);
		title = '';
		description = '';
		targetWords = 10000;
		durationDays = 30;
		showCreate = false;
	}
</script>

<div class="challenges-page">
	<div class="challenges-container">
		<header class="challenges-header">
			<div>
				<h1>🏆 Writing Challenges</h1>
				<p class="subtitle">Join community challenges and hit your writing goals together</p>
			</div>
			<button type="button" class="btn-create" onclick={() => (showCreate = !showCreate)}>
				{showCreate ? '✕ Cancel' : '+ Create'}
			</button>
		</header>

		{#if showCreate}
			<form class="create-form" onsubmit={(e) => { e.preventDefault(); submit(); }}>
				<h2>New Challenge</h2>
				<label>
					Title
					<input type="text" bind:value={title} maxlength="80" placeholder="e.g. NaNoWriMo Sprint" required />
				</label>
				<label>
					Description
					<textarea bind:value={description} maxlength="300" placeholder="What is this challenge about?"></textarea>
				</label>
				<div class="form-row">
					<label>
						Target Words
						<input type="number" bind:value={targetWords} min="100" max="1000000" />
					</label>
					<label>
						Duration (days)
						<input type="number" bind:value={durationDays} min="1" max="365" />
					</label>
				</div>
				<button type="submit" class="btn-submit">Create Challenge</button>
			</form>
		{/if}

		<div class="tabs" role="tablist">
			{#each [{ key: 'active', label: 'All Active' }, { key: 'joined', label: `Joined (${joined.length})` }] as t (t.key)}
				<button
					type="button"
					role="tab"
					aria-selected={tab === t.key}
					class={['tab', tab === t.key && 'tab--active'].filter(Boolean).join(' ')}
					onclick={() => (tab = t.key as 'active' | 'joined')}
				>
					{t.label}
				</button>
			{/each}
		</div>

		{#if displayed.length === 0}
			<div class="empty">
				{#if tab === 'joined'}
					<p>You haven't joined any challenges yet.</p>
					<p>Browse <button type="button" class="link-btn" onclick={() => (tab = 'active')}>active challenges</button> to get started!</p>
				{:else}
					<p>🌱 No active challenges. Create the first one!</p>
				{/if}
			</div>
		{:else}
			<div class="challenges-grid">
				{#each displayed as challenge (challenge.id)}
					<ChallengeCard {challenge} />
				{/each}
			</div>
		{/if}

		<footer class="challenges-footer">
			<p>Challenge progress is tracked locally · <a href="/settings">Settings</a></p>
		</footer>
	</div>
</div>

<style>
	.challenges-page {
		min-height: 100vh;
		padding: 2rem 1rem;
		background: var(--color-background, #f9fafb);
	}

	.challenges-container {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.challenges-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.challenges-header h1 { margin: 0; font-size: 1.75rem; }
	.subtitle { margin: 0.25rem 0 0; color: var(--color-text-secondary, #666); font-size: 0.875rem; }

	.btn-create {
		padding: 0.5rem 1rem;
		background: var(--color-primary, #7c3aed);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-create:hover { opacity: 0.9; }

	.create-form {
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.create-form h2 { margin: 0; font-size: 1.1rem; }

	.create-form label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.create-form input, .create-form textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 6px;
		font-size: 0.9rem;
		background: var(--color-background, #f9fafb);
		color: var(--color-text, #111);
	}

	.create-form textarea { resize: vertical; min-height: 80px; }

	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

	.btn-submit {
		align-self: flex-start;
		padding: 0.5rem 1.25rem;
		background: var(--color-primary, #7c3aed);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
	}

	.tabs {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
		padding-bottom: 0;
	}

	.tab {
		padding: 0.5rem 1rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--color-text-secondary, #666);
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}

	.tab--active {
		color: var(--color-primary, #7c3aed);
		border-bottom-color: var(--color-primary, #7c3aed);
		font-weight: 600;
	}

	.challenges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.empty {
		text-align: center;
		padding: 3rem 1rem;
		background: var(--color-surface, #fff);
		border-radius: 12px;
		border: 1px solid var(--color-border, #e5e7eb);
		color: var(--color-text-secondary, #666);
		font-size: 0.9rem;
		line-height: 1.7;
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--color-primary, #7c3aed);
		cursor: pointer;
		font-size: inherit;
		padding: 0;
		text-decoration: underline;
	}

	.challenges-footer {
		text-align: center;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #aaa);
	}

	.challenges-footer a { color: var(--color-primary, #7c3aed); }
</style>
