<script lang="ts">
	import { partnersStore } from '$lib/partnersStore.svelte';
	import { toastStore } from '$lib/toastStore.svelte';

	// Get the list of partners this user is following
	$: followingList = partnersStore.getFollowing();
	$: followingCount = partnersStore.followingCount;
</script>

<div class="partners-list">
	<div class="partners-header">
		<h2>👥 Accountability Partners</h2>
		<span class="count-badge">{followingCount}</span>
	</div>

	{#if followingList.length === 0}
		<div class="empty-state">
			<p class="empty-icon">🤝</p>
			<h3>No Partners Yet</h3>
			<p>Start following writers to build accountability. Visit their profiles to follow them!</p>
			<a href="/app" class="btn btn-primary">Discover Writers</a>
		</div>
	{:else}
		<div class="partners-grid">
			{#each followingList as partner (partner)}
				<div class="partner-card">
					<div class="partner-header">
						<div class="partner-avatar">👤</div>
						<div class="partner-info">
							<a href={`/profile/@${partner}`} class="partner-name">@{partner}</a>
							<span class="partner-label">Partner</span>
						</div>
					</div>

					<div class="partner-actions">
						<button
							type="button"
							class="btn btn-sm btn-secondary"
							onclick={() => {
								partnersStore.unfollow(partner);
								toastStore.success(`Unfollowed @${partner}`);
							}}
							aria-label={`Unfollow @${partner}`}
						>
							Unfollow
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.partners-list {
		background: var(--color-card-bg, #fff);
		border-radius: 8px;
		padding: 1.5rem;
		border: 1px solid var(--color-border, #e0e0e0);
	}

	.partners-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.partners-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-text, #333);
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--color-primary, #667eea);
		color: white;
		border-radius: 50%;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--color-text-secondary, #666);
	}

	.empty-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: var(--color-text, #333);
	}

	.empty-state p {
		margin: 0 0 1.5rem 0;
		font-size: 0.875rem;
	}

	.btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.btn-primary {
		background: var(--color-primary, #667eea);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark, #5568d3);
	}

	.partners-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.partner-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--color-background, #f9f9f9);
		border-radius: 6px;
		border: 1px solid var(--color-border, #e0e0e0);
		transition: all 0.2s;
	}

	.partner-card:hover {
		background: var(--color-background-hover, #f3f3f3);
		border-color: var(--color-border-hover, #d0d0d0);
	}

	.partner-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.partner-avatar {
		font-size: 2rem;
		line-height: 1;
	}

	.partner-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.partner-name {
		color: var(--color-link, #667eea);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
	}

	.partner-name:hover {
		text-decoration: underline;
	}

	.partner-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary, #666);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.partner-actions {
		flex-shrink: 0;
	}

	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}

	.btn-secondary {
		background: var(--color-secondary, #f0f0f0);
		color: var(--color-text, #333);
		border: 1px solid var(--color-border, #e0e0e0);
	}

	.btn-secondary:hover {
		background: var(--color-secondary-dark, #e0e0e0);
	}

	@media (max-width: 600px) {
		.partners-list {
			padding: 1rem;
		}

		.partner-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.partner-actions {
			width: 100%;
		}

		.partner-actions .btn-sm {
			width: 100%;
			text-align: center;
		}
	}
</style>
