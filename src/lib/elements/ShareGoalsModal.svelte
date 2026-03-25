<script lang="ts">
	import { goalsStore } from '$lib/writingGoalsStore.svelte';
	import { streakStore } from '$lib/streakStore.svelte';
	import { toastStore } from '$lib/toastStore.svelte';

	interface Props {
		onClose?: () => void;
	}

	let { onClose = () => {} }: Props = $props();

	// Derived data
	const currentStreak = $derived(goalsStore.goals.streak);
	const longestStreak = $derived(goalsStore.goals.longestStreak);
	const todayWords = $derived(goalsStore.goals.todayWords);
	const dailyTarget = $derived(goalsStore.goals.dailyTarget);

	// Activity window for the last 30 days
	const monthActivity = $derived(streakStore.getActivityWindow(30));
	const totalThisMonth = $derived(
		Object.values(monthActivity).reduce((a, b) => a + b, 0)
	);

	// Generate shareable text summary
	function generateShareText(): string {
		const date = new Date().toLocaleDateString();
		return `
📝 My Writing Goals & Streaks (${date})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 Current Streak: ${currentStreak} days
⭐ Longest Streak: ${longestStreak} days
📊 Daily Goal: ${todayWords} / ${dailyTarget} words
📅 Sessions This Month: ${totalThisMonth}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keep up the momentum! 🚀
		`.trim();
	}

	function copyToClipboard() {
		const text = generateShareText();
		navigator.clipboard.writeText(text).then(() => {
			toastStore.success('Goals summary copied to clipboard!');
		}).catch(() => {
			toastStore.error('Failed to copy to clipboard');
		});
	}

	function copyLink() {
		const url = window.location.href;
		navigator.clipboard.writeText(url).then(() => {
			toastStore.success('Link copied to clipboard!');
		}).catch(() => {
			toastStore.error('Failed to copy link');
		});
	}

	// Get progress emoji based on percentage
	function getProgressEmoji(current: number, target: number): string {
		if (target === 0) return '📋';
		const percentage = (current / target) * 100;
		if (percentage === 0) return '📭';
		if (percentage < 33) return '📪';
		if (percentage < 66) return '📫';
		if (percentage < 100) return '📬';
		return '📭';
	}
</script>

<!-- Modal overlay -->
<div class="modal-overlay" onclick={onClose} role="presentation"></div>

<!-- Modal -->
<div class="modal" role="dialog" aria-labelledby="share-title">
	<div class="modal-content">
		<div class="modal-header">
			<h2 id="share-title" class="modal-title">Share Your Goals</h2>
			<button
				type="button"
				class="btn-close"
				onclick={onClose}
				aria-label="Close modal"
			>✕</button>
		</div>

		<div class="modal-body">
			<!-- Summary cards -->
			<div class="summary-grid">
				<div class="summary-card">
					<div class="summary-icon">🔥</div>
					<div class="summary-label">Current Streak</div>
					<div class="summary-value">{currentStreak} days</div>
				</div>
				<div class="summary-card">
					<div class="summary-icon">⭐</div>
					<div class="summary-label">Longest Streak</div>
					<div class="summary-value">{longestStreak} days</div>
				</div>
				<div class="summary-card">
					<div class="summary-icon">{getProgressEmoji(todayWords, dailyTarget)}</div>
					<div class="summary-label">Today's Progress</div>
					<div class="summary-value">{todayWords} / {dailyTarget}</div>
				</div>
				<div class="summary-card">
					<div class="summary-icon">📅</div>
					<div class="summary-label">This Month</div>
					<div class="summary-value">{totalThisMonth} sessions</div>
				</div>
			</div>

			<!-- Share text preview -->
			<div class="share-preview">
				<h3 class="preview-title">Share Summary</h3>
				<pre class="preview-text">{generateShareText()}</pre>
			</div>

			<!-- Action buttons -->
			<div class="button-group">
				<button
					type="button"
					class="btn btn-primary"
					onclick={copyToClipboard}
					aria-label="Copy goals summary to clipboard"
				>
					📋 Copy Summary
				</button>
				<button
					type="button"
					class="btn btn-secondary"
					onclick={copyLink}
					aria-label="Copy link to clipboard"
				>
					🔗 Copy Link
				</button>
			</div>
		</div>

		<div class="modal-footer">
			<button
				type="button"
				class="btn btn-outline"
				onclick={onClose}
			>
				Close
			</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--color-background, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.625rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		z-index: 1001;
		max-width: 500px;
		width: 90%;
		max-height: 85vh;
		overflow-y: auto;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.modal-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--color-text-muted, #9ca3af);
		transition: color 0.2s;
	}

	.btn-close:hover {
		color: var(--color-text, #1f2937);
	}

	.modal-body {
		padding: 1.5rem;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.summary-card {
		padding: 1rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.summary-icon {
		font-size: 1.75rem;
	}

	.summary-label {
		font-size: 0.75rem;
		color: var(--color-text-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.summary-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.share-preview {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.preview-title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.preview-text {
		margin: 0;
		padding: 1rem;
		background: var(--color-surface, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.375rem;
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--color-text, #1f2937);
		white-space: pre-wrap;
		word-wrap: break-word;
		font-family: monospace;
	}

	.button-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: var(--color-primary, #3b82f6);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark, #1e40af);
	}

	.btn-secondary {
		background: var(--color-accent, #7c3aed);
		color: white;
	}

	.btn-secondary:hover {
		background: #6d28d9;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid var(--color-border, #e5e7eb);
		color: var(--color-text, #1f2937);
	}

	.btn-outline:hover {
		background: var(--color-surface, #f9fafb);
	}

	.modal-footer {
		padding: 1rem 1.25rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	@media (max-width: 600px) {
		.modal {
			width: 95%;
			max-height: 90vh;
		}

		.summary-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.button-group {
			grid-template-columns: 1fr;
		}
	}
</style>
