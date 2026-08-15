<script lang="ts">
	import { userProfileStore } from '$lib/userProfileStore.svelte';

	interface Props {
		editable?: boolean;
		onEditClick?: () => void;
	}

	let { editable = false, onEditClick }: Props = $props();

	const profile = $derived(userProfileStore.profile);
</script>

<div class="profile-card">
	<!-- Profile header -->
	<div class="profile-header">
		<div class="profile-avatar">
			<span class="avatar-emoji">✍️</span>
		</div>
		<div class="profile-info">
			<h1 class="profile-name">{profile.name}</h1>
			{#if profile.bio}
				<p class="profile-bio">{profile.bio}</p>
			{/if}
			{#if profile.username}
				<p class="profile-username">@{profile.username}</p>
			{/if}
		</div>
		{#if editable}
			<button
				type="button"
				class="btn-edit"
				onclick={onEditClick}
				aria-label="Edit profile"
				title="Edit profile"
			>
				✏️
			</button>
		{/if}
	</div>

	<!-- Visibility badge -->
	<div class="visibility-badge" class:public={userProfileStore.isPublic}>
		{userProfileStore.isPublic ? '🌍 Public' : '🔒 Private'}
	</div>

</div>

<style>
	.profile-card {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		background: var(--color-background, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.75rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	/* Profile header */
	.profile-header {
		display: flex;
		gap: 1.5rem;
		align-items: flex-start;
		position: relative;
	}

	.profile-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: var(--color-surface, #f9fafb);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.avatar-emoji {
		font-size: 2.5rem;
	}

	.profile-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}

	.profile-name {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
	}

	.profile-bio {
		margin: 0;
		font-size: 0.95rem;
		color: var(--color-text-muted, #6b7280);
		line-height: 1.5;
	}

	.profile-username {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-primary, #3b82f6);
		font-weight: 500;
	}

	.btn-edit {
		position: absolute;
		top: 0;
		right: 0;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.2s;
	}

	.btn-edit:hover {
		background: var(--color-surface, #f9fafb);
	}

	/* Visibility badge */
	.visibility-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #fee2e2;
		color: #991b1b;
		border-radius: 9999px;
		font-size: 0.85rem;
		font-weight: 600;
		width: fit-content;
	}

	.visibility-badge.public {
		background: #dcfce7;
		color: #166534;
	}

	@media (max-width: 600px) {
		.profile-card {
			padding: 1.5rem;
			gap: 1rem;
		}

		.profile-header {
			gap: 1rem;
		}

		.profile-avatar {
			width: 60px;
			height: 60px;
		}

		.avatar-emoji {
			font-size: 2rem;
		}

		.profile-name {
			font-size: 1.5rem;
		}

	}
</style>
