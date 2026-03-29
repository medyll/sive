<script lang="ts">
	import { onMount } from 'svelte';
	import { aiService, type AIProvider } from '$lib/server/ai/service';

	type ProviderStatus = {
		provider: AIProvider;
		available: boolean;
		loading: boolean;
	};

	let providers: ProviderStatus[] = $state([
		{ provider: 'ollama', available: false, loading: true },
		{ provider: 'anthropic', available: false, loading: true },
		{ provider: 'openai', available: false, loading: true },
		{ provider: 'gemini', available: false, loading: true }
	]);

	let selectedProvider = $state<AIProvider>('ollama');
	let selectedModel = $state('mistral');
	let temperature = $state(0.7);
	let maxTokens = $state(1024);
	let streamingEnabled = $state(true);
	let fallbackEnabled = $state(true);

	let testPrompt = $state('Write a haiku about writing.');
	let testResponse = $state('');
	let testing = $state(false);

	onMount(async () => {
		await checkProviders();
	});

	async function checkProviders() {
		for (const p of providers) {
			p.loading = true;
		}

		const available = await aiService.getAvailableProviders();

		providers = providers.map((p) => ({
			...p,
			available: available.includes(p.provider),
			loading: false
		}));

		// Select first available provider
		const firstAvailable = available[0];
		if (firstAvailable) {
			selectedProvider = firstAvailable;
		}
	}

	async function runTest() {
		testing = true;
		testResponse = '';

		try {
			if (streamingEnabled) {
				const stream = aiService.generateStream({
					prompt: testPrompt,
					provider: selectedProvider,
					taskType: 'chat',
					config: { temperature, maxTokens }
				});

				for await (const chunk of stream) {
					testResponse += chunk;
				}
			} else {
				const response = await aiService.generate({
					prompt: testPrompt,
					provider: selectedProvider,
					taskType: 'chat',
					config: { temperature, maxTokens }
				});
				testResponse = response.content;
			}
		} catch (err) {
			testResponse = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
		} finally {
			testing = false;
		}
	}

	function getProviderIcon(provider: AIProvider): string {
		switch (provider) {
			case 'ollama':
				return '🦙';
			case 'anthropic':
				return '🤖';
			case 'openai':
				return '🧠';
			case 'gemini':
				return '💎';
		}
	}
</script>

<div class="ai-settings p-4">
	<h2 class="text-xl font-bold mb-4">AI Settings</h2>

	<!-- Provider Status -->
	<section class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Available Providers</h3>
		<div class="grid grid-cols-2 gap-2">
			{#each providers as provider}
				<button
					class="flex items-center gap-2 p-3 rounded border transition-colors
						{provider.available ? 'bg-primary/10 border-primary' : 'bg-muted border-border opacity-50'}
						{selectedProvider === provider.provider ? 'ring-2 ring-primary' : ''}"
					onclick={() => provider.available && (selectedProvider = provider.provider)}
					disabled={!provider.available}
				>
					<span class="text-2xl">{getProviderIcon(provider.provider)}</span>
					<div class="text-left">
						<div class="font-medium capitalize">{provider.provider}</div>
						{#if provider.loading}
							<div class="text-xs text-muted">Checking...</div>
						{:else if provider.available}
							<div class="text-xs text-green-600">Available</div>
						{:else}
							<div class="text-xs text-red-600">Unavailable</div>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</section>

	<!-- Model Settings -->
	<section class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Model Settings</h3>
		
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium mb-1">Model</label>
				<input
					type="text"
					bind:value={selectedModel}
					class="w-full px-3 py-2 border rounded bg-background"
					placeholder="e.g., mistral, llama2"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-1">
					Temperature: {temperature.toFixed(1)}
				</label>
				<input
					type="range"
					min="0"
					max="1"
					step="0.1"
					bind:value={temperature}
					class="w-full"
				/>
				<div class="flex justify-between text-xs text-muted">
					<span>Precise</span>
					<span>Creative</span>
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium mb-1">Max Tokens</label>
				<input
					type="number"
					bind:value={maxTokens}
					class="w-full px-3 py-2 border rounded bg-background"
					min="64"
					max="8192"
				/>
			</div>
		</div>
	</section>

	<!-- Options -->
	<section class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Options</h3>
		
		<div class="space-y-2">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={streamingEnabled} />
				<span>Enable streaming responses</span>
			</label>

			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={fallbackEnabled} />
				<span>Fallback to local model if cloud unavailable</span>
			</label>
		</div>
	</section>

	<!-- Test -->
	<section>
		<h3 class="text-lg font-semibold mb-2">Test Configuration</h3>
		
		<div class="space-y-2">
			<textarea
				bind:value={testPrompt}
				class="w-full px-3 py-2 border rounded bg-background min-h-[80px]"
				placeholder="Enter a test prompt..."
			/>
			
			<button
				onclick={runTest}
				disabled={testing}
				class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
			>
				{testing ? 'Testing...' : 'Run Test'}
			</button>

			{#if testResponse}
				<div class="mt-2 p-3 border rounded bg-muted">
					<div class="text-xs text-muted mb-1">Response:</div>
					<div class="whitespace-pre-wrap">{testResponse}</div>
				</div>
			{/if}
		</div>
	</section>
</div>

<style>
	.ai-settings {
		max-width: 600px;
		margin: 0 auto;
	}
</style>
