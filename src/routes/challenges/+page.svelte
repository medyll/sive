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
	/* ───────────────────────────────────────────────────────────────────────
	   CSS migrated to @medyll/css-base tokens
	   ─────────────────────────────────────────────────────────────────────── */

	.challenges-page {
		min-height: 100vh;
		padding: var(--pad-2xl) var(--pad-md);
		background: var(--color-surface);
	}

	.challenges-container {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--gap-md);
	}

	.challenges-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.challenges-header h1 {
		margin: 0;
		font-size: var(--text-2xl);
		color: var(--color-text);
	}

	.subtitle {
		margin: var(--pad-xs) 0 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.btn-create {
		padding: var(--pad-sm) var(--pad-md);
		background: var(--color-primary);
		color: var(--color-surface);
		border: none;
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		cursor: pointer;
		white-space: nowrap;
		transition: var(--transition-fast);
	}

	.btn-create:hover { opacity: 0.9; }

	.create-form {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--pad-lg);
		display: flex;
		flex-direction: column;
		gap: var(--gap-md);
	}

	.create-form h2 {
		margin: 0;
		font-size: var(--text-lg);
		color: var(--color-text);
	}

	.create-form label {
		display: flex;
		flex-direction: column;
		gap: var(--gap-xs);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--color-text);
	}

	.create-form input,
	.create-form textarea {
		padding: var(--pad-sm) var(--pad-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.create-form input:focus,
	.create-form textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px var(--color-primary-hover);
	}

	.create-form textarea { resize: vertical; min-height: 80px; }

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--gap-md);
	}

	.btn-submit {
		align-self: flex-start;
		padding: var(--pad-sm) var(--pad-lg);
		background: var(--color-primary);
		color: var(--color-surface);
		border: none;
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: var(--transition-fast);
	}

	.btn-submit:hover {
		background: var(--color-primary-hover);
	}

	.tabs {
		display: flex;
		gap: var(--gap-xs);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0;
	}

	.tab {
		padding: var(--pad-sm) var(--pad-md);
		border: none;
		background: none;
		cursor: pointer;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		transition: var(--transition-fast);
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab--active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
		font-weight: var(--font-semibold);
	}

	.challenges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--gap-md);
	}

	.empty {
		text-align: center;
		padding: var(--pad-3xl) var(--pad-md);
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		cursor: pointer;
		font-size: inherit;
		padding: 0;
		text-decoration: underline;
	}

	.challenges-footer {
		text-align: center;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.challenges-footer a {
		color: var(--color-primary);
	}
</style>
