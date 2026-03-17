<script lang="ts">
	let deferredPrompt = $state<Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);
	let dismissed = $state(false);

	$effect(() => {
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e as typeof deferredPrompt;
		});

		// Register service worker
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(() => {/* ignore */});
		}
	});

	async function install() {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') dismissed = true;
		deferredPrompt = null;
	}
</script>

{#if deferredPrompt && !dismissed}
	<div class="install-banner" role="banner">
		<span>📱 Install Sive for a better offline experience</span>
		<div class="install-actions">
			<button class="primary" onclick={install}>Install</button>
			<button onclick={() => (dismissed = true)}>Dismiss</button>
		</div>
	</div>
{/if}

<style>
	.install-banner {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: var(--surface, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0,0,0,0.12);
		padding: 0.75rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		z-index: 500;
		font-size: 0.875rem;
		width: min(480px, calc(100vw - 2rem));
	}
	.install-actions { display: flex; gap: 0.5rem; margin-left: auto; }
	.install-actions button { padding: 0.35rem 0.75rem; border-radius: 6px; border: 1px solid var(--border, #e5e7eb); cursor: pointer; background: none; font-size: 0.8rem; white-space: nowrap; }
	.install-actions button.primary { background: var(--accent, #7c3aed); color: #fff; border-color: transparent; }
</style>
