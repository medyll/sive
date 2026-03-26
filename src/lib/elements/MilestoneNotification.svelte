<script lang="ts">
	import { celebrationStore } from '$lib/celebrationStore.svelte';
	import { createConfetti, playSound } from '$lib/confetti';

	$: current = celebrationStore.state.current;

	$: if (current) {
		// Trigger confetti if enabled
		if (current.confetti) {
			createConfetti({
				count: 60,
				duration: 2000
			});
		}

		// Play sound if enabled
		if (current.sound) {
			playSound('celebration');
		}
	}
</script>

{#if current}
	<div class="milestone-notification" in:scale={{ duration: 300 }} out:scale={{ duration: 300 }}>
		<div class="milestone-content">
			<span class="milestone-icon">{current.icon}</span>
			<div class="milestone-text">
				<h3 class="milestone-title">{current.title}</h3>
				<p class="milestone-message">{current.message}</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.milestone-notification {
		position: fixed;
		top: 2rem;
		right: 2rem;
		z-index: 9998;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		max-width: 400px;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(500px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.milestone-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.milestone-icon {
		font-size: 2.5rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.milestone-text {
		flex: 1;
	}

	.milestone-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.milestone-message {
		margin: 0.25rem 0 0 0;
		font-size: 0.95rem;
		opacity: 0.95;
	}

	/* Mobile responsive */
	@media (max-width: 600px) {
		.milestone-notification {
			right: 1rem;
			left: 1rem;
			max-width: none;
		}
	}

	/* Respect prefers-reduced-motion */
	@media (prefers-reduced-motion: reduce) {
		.milestone-notification {
			animation: none;
			opacity: 1;
		}
	}
</style>
