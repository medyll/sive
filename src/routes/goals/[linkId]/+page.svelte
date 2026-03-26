<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: userId = data.userId;
	$: expiresAt = new Date(data.expiresAt);
	$: daysLeft = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
</script>

<div class="goals-share-page">
	<div class="goals-container">
		<!-- Header -->
		<header class="share-header">
			<div class="header-content">
				<h1>📊 Shared Writing Goals</h1>
				<p class="subtitle">Check out this writer's progress and achievements!</p>
			</div>
			<div class="expiry-badge">
				{#if daysLeft > 0}
					<span class="badge badge-active">Active for {daysLeft} more {daysLeft === 1 ? 'day' : 'days'}</span>
				{:else}
					<span class="badge badge-expired">Link Expired</span>
				{/if}
			</div>
		</header>

		<!-- Stats Grid -->
		<div class="stats-grid">
			<!-- Current Streak -->
			<div class="stat-card">
				<div class="stat-icon">🔥</div>
				<div class="stat-content">
					<h3>Current Streak</h3>
					<p class="stat-value">Loading...</p>
				</div>
			</div>

			<!-- Longest Streak -->
			<div class="stat-card">
				<div class="stat-icon">⭐</div>
				<div class="stat-content">
					<h3>Longest Streak</h3>
					<p class="stat-value">Loading...</p>
				</div>
			</div>

			<!-- Total Words -->
			<div class="stat-card">
				<div class="stat-icon">✍️</div>
				<div class="stat-content">
					<h3>Total Words</h3>
					<p class="stat-value">Loading...</p>
				</div>
			</div>

			<!-- Badges -->
			<div class="stat-card">
				<div class="stat-icon">🏅</div>
				<div class="stat-content">
					<h3>Badges Earned</h3>
					<p class="stat-value">Loading...</p>
				</div>
			</div>
		</div>

		<!-- Badges Section -->
		<section class="badges-section">
			<h2>🏆 Achievements</h2>
			<div class="badges-list">
				<p class="loading-text">Loading achievements...</p>
			</div>
		</section>

		<!-- Weekly Stats -->
		<section class="weekly-section">
			<h2>📈 Weekly Stats</h2>
			<div class="weekly-table">
				<p class="loading-text">Loading weekly stats...</p>
			</div>
		</section>

		<!-- Footer -->
		<footer class="share-footer">
			<p>👋 Interested in building writing habits together?</p>
			<a href="/" class="btn btn-primary">Start Your Own Writing Journey</a>
		</footer>
	</div>
</div>

<style>
	:global(body) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.goals-share-page {
		min-height: 100vh;
		padding: 2rem 1rem;
	}

	.goals-container {
		max-width: 900px;
		margin: 0 auto;
	}

	.share-header {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.header-content h1 {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.subtitle {
		margin: 0;
		color: #666;
		font-size: 1rem;
	}

	.expiry-badge {
		flex-shrink: 0;
	}

	.badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.badge-active {
		background: #ecfdf5;
		color: #065f46;
	}

	.badge-expired {
		background: #fee2e2;
		color: #991b1b;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.stat-icon {
		font-size: 2rem;
	}

	.stat-content h3 {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		color: #666;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #333;
	}

	.badges-section,
	.weekly-section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.badges-section h2,
	.weekly-section h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		color: #333;
	}

	.badges-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 1rem;
	}

	.weekly-table {
		width: 100%;
	}

	.loading-text {
		color: #999;
		text-align: center;
		padding: 2rem;
		margin: 0;
	}

	.share-footer {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.share-footer p {
		margin: 0 0 1rem 0;
		color: #666;
		font-size: 1rem;
	}

	.btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	@media (max-width: 600px) {
		.share-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-content h1 {
			font-size: 1.5rem;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
