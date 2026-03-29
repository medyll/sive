<script lang="ts">
	import { onMount } from 'svelte';
	
	let installPrompt: BeforeInstallPromptEvent | null = $state(null);
	let isInstalled = $state(false);
	let showPrompt = $state(false);
	
	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}
	
	onMount(() => {
		// Listen for install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			installPrompt = e as BeforeInstallPromptEvent;
			showPrompt = true;
		});
		
		// Check if already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			isInstalled = true;
		}
		
		// Listen for install success
		window.addEventListener('appinstalled', () => {
			isInstalled = true;
			showPrompt = false;
			installPrompt = null;
		});
	});
	
	async function handleInstall() {
		if (!installPrompt) return;
		
		await installPrompt.prompt();
		const choice = await installPrompt.userChoice;
		
		if (choice.outcome === 'accepted') {
			console.log('[PWA] User accepted install');
		} else {
			console.log('[PWA] User dismissed install');
		}
		
		installPrompt = null;
		showPrompt = false;
	}
	
	function dismiss() {
		showPrompt = false;
	}
</script>

{#if showPrompt && !isInstalled}
	<div class="install-prompt fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
		<div class="flex items-start gap-3">
			<div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18v-6m0 0V6m0 6h6m-6 0H6" />
				</svg>
			</div>
			<div class="flex-1">
				<h4 class="font-semibold mb-1">Install Sive</h4>
				<p class="text-sm text-muted mb-3">
					Install Sive for quick access and offline writing.
				</p>
				<div class="flex gap-2">
					<button
						onclick={handleInstall}
						class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
					>
						Install
					</button>
					<button
						onclick={dismiss}
						class="px-3 py-1.5 text-sm text-muted hover:text-foreground"
					>
						Not now
					</button>
				</div>
			</div>
			<button onclick={dismiss} class="text-muted hover:text-foreground">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}
