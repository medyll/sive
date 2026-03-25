<script lang="ts">
	import { page } from '$app/stores';
	import UserProfileCard from '$lib/elements/UserProfileCard.svelte';
	import { userProfileStore } from '$lib/userProfileStore.svelte';
	import { partnersStore } from '$lib/partnersStore.svelte';
	import { toastStore } from '$lib/toastStore.svelte';

	const username = $page.params.username;

	// Check if viewing own profile
	const isOwnProfile = $derived(
		userProfileStore.profile.username === username
	);

	// Check if profile is public
	const isPublic = $derived(
		isOwnProfile || userProfileStore.isPublic
	);

	// Check if already following this user
	const isFollowing = $derived(
		!isOwnProfile && partnersStore.isFollowing(username)
	);

	function handleFollowClick() {
		if (isFollowing) {
			partnersStore.unfollow(username);
			toastStore.success(`Unfollowed @${username}`);
		} else {
			partnersStore.follow(username);
			toastStore.success(`Following @${username}! 🎉`);
		}
	}
</script>

<div class="profile-page">
	<div class="profile-container">
		{#if isPublic}
			<UserProfileCard
				editable={isOwnProfile}
				onEditClick={() => {}}
			/>

			<!-- Action buttons for non-own profiles -->
			{#if !isOwnProfile}
				<div class="action-buttons">
					<button
						type="button"
						class={['btn', 'btn-follow', isFollowing && 'btn-following'].filter(Boolean).join(' ')}
						onclick={handleFollowClick}
						aria-label={isFollowing ? `Unfollow @${username}` : `Follow @${username}`}
					>
						{isFollowing ? '👥 Following' : '➕ Follow for Accountability'}
					</button>
					<button
						type="button"
						class="btn btn-secondary"
						aria-label="Share this profile"
						title="Share this profile"
					>
						🔗 Share Profile
					</button>
				</div>
			{:else}
				<div class="edit-hint">
					<p>This is your profile. <a href="/settings">Edit your profile →</a></p>
				</div>
			{/if}
		{:else}
			<!-- Private profile message -->
			<div class="private-profile">
				<div class="private-icon">🔒</div>
				<h1>Profile is Private</h1>
				<p>
					<strong>@{username}</strong> has set their profile to private.
				</p>
				<p class="private-message">
					Come back when they make it public, or ask them to follow you back for mutual accountability!
				</p>
				<a href="/" class="btn btn-primary">Back to Home</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.profile-page {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		min-height: 100vh;
		padding: 2rem 1rem;
		background: var(--color-background, #fff);
	}

	.profile-container {
		width: 100%;
		max-width: 600px;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* Action buttons */
	.action-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.btn {
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn-follow {
		background: var(--color-primary, #3b82f6);
		color: white;
	}

	.btn-follow:hover {
		background: var(--color-primary-dark, #1e40af);
	}

	.btn-follow.btn-following {
		background: var(--color-border, #e5e7eb);
		color: var(--color-text, #1f2937);
	}

	.btn-follow.btn-following:hover {
		background: #d1d5db;
	}

	.btn-secondary {
		background: var(--color-accent, #7c3aed);
		color: white;
	}

	.btn-secondary:hover {
		background: #6d28d9;
	}

	.btn-primary {
		background: var(--color-primary, #3b82f6);
		color: white;
		margin-top: 1rem;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark, #1e40af);
	}

	/* Edit hint for own profile */
	.edit-hint {
		padding: 1rem 1.5rem;
		background: #dcfce7;
		border-left: 4px solid #16a34a;
		border-radius: 0.375rem;
		text-align: center;
	}

	.edit-hint p {
		margin: 0;
		color: #166534;
		font-size: 0.9rem;
	}

	.edit-hint a {
		color: #166534;
		font-weight: 600;
		text-decoration: none;
	}

	.edit-hint a:hover {
		text-decoration: underline;
	}

	/* Private profile state */
	.private-profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 3rem 2rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.75rem;
		text-align: center;
	}

	.private-icon {
		font-size: 4rem;
		line-height: 1;
	}

	.private-profile h1 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--color-text, #1f2937);
	}

	.private-profile p {
		margin: 0;
		color: var(--color-text-muted, #6b7280);
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.private-message {
		font-style: italic;
		color: var(--color-text-muted, #6b7280);
	}

	@media (max-width: 600px) {
		.profile-page {
			padding: 1rem 0.75rem;
		}

		.profile-container {
			gap: 1.5rem;
		}

		.action-buttons {
			grid-template-columns: 1fr;
		}

		.private-profile {
			padding: 2rem 1.5rem;
		}

		.private-profile h1 {
			font-size: 1.25rem;
		}
	}
</style>
