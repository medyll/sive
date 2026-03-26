<script lang="ts">
	import { partnersStore } from '$lib/partnersStore.svelte';
	import { toastStore } from '$lib/toastStore.svelte';
	import type { DiscoveryProfile } from '$lib/server/discoveryQueries';

	export let profile: DiscoveryProfile;
	export let currentUserId: string = '';

	$: isSelf = profile.userId === currentUserId;
	$: isFollowing = partnersStore.isFollowing(profile.userId);

	function toggleFollow() {
		if (isFollowing) {
			partnersStore.unfollow(profile.userId);
			toastStore.success(`Unfollowed ${profile.displayName}`);
		} else {
			partnersStore.follow(profile.userId);
			toastStore.success(`Now following ${profile.displayName}! 🎉`);
		}
	}
</script>

<div class="writer-card">
	<div class="card-avatar">✍️</div>

	<div class="card-body">
		<a href={`/profile/${profile.displayName}`} class="card-name">{profile.displayName}</a>

		<div class="card-stats">
			<span title="Current streak">🔥 {profile.currentStreak}d</span>
			<span title="Total words">✍️ {profile.totalWords.toLocaleString()}</span>
			{#if profile.topBadgeName !== 'Writer'}
				<span title={profile.topBadgeName}>{profile.topBadgeIcon}</span>
			{/if}
		</div>
	</div>

	{#if !isSelf}
		<button
			type="button"
			class={['btn-follow', isFollowing && 'btn-follow--active'].filter(Boolean).join(' ')}
			onclick={toggleFollow}
			aria-label={isFollowing ? `Unfollow ${profile.displayName}` : `Follow ${profile.displayName}`}
		>
			{isFollowing ? '✓ Following' : '+ Follow'}
		</button>
	{/if}
</div>

<style>
	.writer-card {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 1rem;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 10px;
		transition: box-shadow 0.15s, border-color 0.15s;
	}

	.writer-card:hover {
		border-color: var(--color-primary, #7c3aed);
		box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
	}

	.card-avatar {
		font-size: 2rem;
		flex-shrink: 0;
		width: 2.5rem;
		text-align: center;
	}

	.card-body { flex: 1; min-width: 0; }

	.card-name {
		display: block;
		font-weight: 600;
		color: var(--color-text, #111);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.95rem;
	}

	.card-name:hover { color: var(--color-primary, #7c3aed); }

	.card-stats {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.25rem;
		font-size: 0.8rem;
		color: var(--color-text-secondary, #666);
	}

	.btn-follow {
		flex-shrink: 0;
		padding: 0.4rem 0.875rem;
		border: 1px solid var(--color-primary, #7c3aed);
		border-radius: 20px;
		background: transparent;
		color: var(--color-primary, #7c3aed);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.btn-follow:hover { background: var(--color-primary, #7c3aed); color: white; }

	.btn-follow--active {
		background: var(--color-primary, #7c3aed);
		color: white;
	}

	.btn-follow--active:hover {
		background: transparent;
		color: var(--color-primary, #7c3aed);
	}
</style>
