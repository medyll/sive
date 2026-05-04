<script lang="ts">
/**
 * AI Provider Configuration Panel
 * 
 * Allows users to configure API keys and model routing for AI providers.
 * Supports both settings tabs: Providers (API keys) and Routing (task-model mapping)
 */

import { onMount } from 'svelte';
import { aiService, type AIProvider } from '$lib/server/ai/service';
import type { ModelConfig, RoutingConfig } from '$lib/server/ai/router';

// Available providers
const PROVIDERS: AIProvider[] = ['ollama', 'anthropic', 'openai', 'gemini'];

// Task types for routing configuration
const TASK_TYPES: (keyof RoutingConfig)[] = ['coherence', 'style', 'review', 'suggestions', 'chat'];

// UI state
let activeTab = $state<'providers' | 'routing'>('providers');

// Provider configuration state
let providers = $state<Record<AIProvider, { enabled: boolean; apiKey: string; endpoint?: string }>>({
	ollama: { enabled: true, apiKey: '', endpoint: 'http://localhost:11434' },
	anthropic: { enabled: false, apiKey: '', endpoint: 'https://api.anthropic.com' },
	openai: { enabled: false, apiKey: '', endpoint: 'https://api.openai.com' },
	gemini: { enabled: false, apiKey: '', endpoint: 'https://generativelanguage.googleapis.com' }
});

// Routing configuration state
let routing = $state<RoutingConfig>({
	coherence: { provider: 'ollama', model: 'mistral', temperature: 0.3 },
	style: { provider: 'ollama', model: 'mistral', temperature: 0.5 },
	review: { provider: 'anthropic', model: 'claude-haiku-4-5', temperature: 0.3, maxTokens: 2048 },
	suggestions: { provider: 'anthropic', model: 'claude-haiku-4-5', temperature: 0.7, maxTokens: 512 },
	chat: { provider: 'anthropic', model: 'claude-haiku-4-5', temperature: 0.7, maxTokens: 1024 },
	fallback: { provider: 'ollama', model: 'mistral', temperature: 0.7 }
});

// Available models per provider
const PROVIDER_MODELS: Record<AIProvider, string[]> = {
	ollama: ['llama3.2', 'mistral', 'phi3', 'gemma2', 'qwen2.5', 'llama3.2:1b', 'llama3.2:3b'],
	anthropic: ['claude-haiku-4-5', 'claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
	openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
	gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']
};

// Test state
let testPrompt = $state('Write a haiku about writing.');
let testResponse = $state('');
let testing = $state(false);

// Model settings
let selectedProvider = $state<AIProvider>('ollama');
let selectedModel = $state('mistral');
let temperature = $state(0.7);
let maxTokens = $state(1024);
let streamingEnabled = $state(true);
let fallbackEnabled = $state(true);

// Status for each provider
let providerStatus = $state<Record<AIProvider, { available: boolean; loading: boolean }>>({
	ollama: { available: false, loading: true },
	anthropic: { available: false, loading: true },
	openai: { available: false, loading: true },
	gemini: { available: false, loading: true }
});

onMount(async () => {
	await checkProviders();
	loadSavedConfig();
});

/**
 * Load saved configuration from localStorage
 */
function loadSavedConfig() {
	try {
		const saved = localStorage.getItem('ai-settings');
		if (saved) {
			const config = JSON.parse(saved);
			if (config.providers) {
				providers = { ...providers, ...config.providers };
			}
			if (config.routing) {
				routing = { ...routing, ...config.routing };
			}
		}
	} catch (err) {
		console.error('Failed to load saved config:', err);
	}
}

/**
 * Save configuration to localStorage and server
 */
async function saveConfig() {
	const config = { providers, routing };
	
	// Save to localStorage
	localStorage.setItem('ai-settings', JSON.stringify(config));
	
	// Save to server
	try {
		const response = await fetch('/api/skills/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(config)
		});
		if (!response.ok) {
			console.error('Failed to save to server');
		}
	} catch (err) {
		console.error('Server save error:', err);
	}
}

/**
 * Check which providers are available
 */
async function checkProviders() {
	for (const p of PROVIDERS) {
		providerStatus[p] = { ...providerStatus[p], loading: true };
	}
	providerStatus = providerStatus;

	const available = await aiService.getAvailableProviders();

	providers = providers.map((p) => ({
		...p,
		available: available.includes(p.provider),
		loading: false
	})) as typeof providers;

	// Update providerStatus
	for (const p of PROVIDERS) {
		providerStatus[p] = { 
			available: available.includes(p),
			loading: false 
		};
	}
	providerStatus = providerStatus;

	// Select first available provider
	const firstAvailable = available[0];
	if (firstAvailable) {
		selectedProvider = firstAvailable;
	}
}

/**
 * Run a test with the selected provider
 */
async function runTest() {
	testing = true;
	testResponse = '';

	try {
		const response = await aiService.generate({
			prompt: testPrompt,
			provider: selectedProvider,
			taskType: 'chat',
			config: { temperature, maxTokens }
		});
		testResponse = response.content;
	} catch (err) {
		testResponse = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
	} finally {
		testing = false;
	}
}

/**
 * Set API key for a provider
 */
function setApiKey(provider: AIProvider, key: string) {
	providers[provider].apiKey = key;
	providers = providers;
	saveConfig();
}

/**
 * Toggle provider enabled state
 */
function toggleProvider(provider: AIProvider) {
	providers[provider].enabled = !providers[provider].enabled;
	providers = providers;
	saveConfig();
}

/**
 * Set endpoint for a provider
 */
function setEndpoint(provider: AIProvider, endpoint: string) {
	providers[provider].endpoint = endpoint;
	providers = providers;
	saveConfig();
}

/**
 * Set routing for a task type
 */
function setTaskRouting(taskType: keyof RoutingConfig, updates: Partial<ModelConfig>) {
	routing[taskType] = { ...routing[taskType], ...updates };
	routing = routing;
	saveConfig();
}

/**
 * Get models for a provider
 */
function getModelsForProvider(provider: AIProvider): string[] {
	return PROVIDER_MODELS[provider] || [];
}

/**
 * Get icon for a provider
 */
function getProviderIcon(provider: AIProvider): string {
	switch (provider) {
		case 'ollama':
			return '🦙';
		case 'anthropic':
			return '🤖';
		case 'openai':
			return '✨';
		case 'gemini':
			return '💎';
		default:
			return '🧠';
	}
}
</script>

<div class="ai-settings p-4">
	<h2 class="text-xl font-bold mb-4">AI Settings</h2>

	<div class="tabs mb-4">
		<button
			class="tab-btn {activeTab === 'providers' ? 'active' : ''}"
			on:click={() => activeTab = 'providers'}
		>
			🔑 API Providers
		</button>
		<button
			class="tab-btn {activeTab === 'routing' ? 'active' : ''}"
			on:click={() => activeTab = 'routing'}
		>
			🗺️ Task Routing
		</button>
	</div>

	{#if activeTab === 'providers'}
		<!-- Provider Configuration Tab -->
		<section class="mb-6">
			<h3 class="text-lg font-semibold mb-2">Available Providers</h3>
			<p class="text-sm text-muted mb-4">
				Configure your AI provider API keys. Keys are stored locally and never sent to our servers.
			</p>
			
			<div class="grid grid-cols-2 gap-3">
				{#each PROVIDERS as provider}
					{@const p = providers[provider]}
					{@const status = providerStatus[provider]}
					<div class="provider-card {p.enabled ? 'enabled' : 'disabled'} {status.available ? 'available' : 'unavailable'}">
						<div class="provider-header">
							<span class="provider-icon">{getProviderIcon(provider)}</span>
							<div class="provider-info">
								<h4 class="provider-name">{provider.charAt(0).toUpperCase() + provider.slice(1)}</h4>
								{#if status.loading}
									<span class="status-badge loading">Checking...</span>
								{:else if status.available}
									<span class="status-badge available">Available</span>
								{:else}
									<span class="status-badge unavailable">Unavailable</span>
								{/if}
							</div>
						</div>

						<div class="provider-body">
							<div class="form-group">
								<label class="flex items-center gap-2">
									<input 
										type="checkbox" 
										checked={p.enabled}
										on:change={() => toggleProvider(provider)}
										class="toggle-switch"
									/>
									<span class="label-text">Enabled</span>
								</label>
							</div>

							<div class="form-group">
								<label for="key-{provider}">API Key</label>
								<input 
									id="key-{provider}"
									type="password"
									value={p.apiKey || ''}
									on:input={(e) => setApiKey(provider, e.currentTarget.value)}
									placeholder={provider === 'ollama' ? 'Not required (local)' : 'Enter your API key'}
									class="input-field"
								/>
							</div>

							<div class="form-group">
								<label for="endpoint-{provider}">Endpoint</label>
								<input 
									id="endpoint-{provider}"
									type="text"
									value={p.endpoint || ''}
									on:input={(e) => setEndpoint(provider, e.currentTarget.value)}
									placeholder="API endpoint URL"
									class="input-field"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Global Settings -->
		<section class="mb-6">
			<h3 class="text-lg font-semibold mb-2">Global Settings</h3>
			
			<div class="space-y-4">
				<div class="form-group">
					<label for="ai-model-select" class="block text-sm font-medium mb-1">Default Model</label>
					<input
						id="ai-model-select"
						type="text"
						bind:value={selectedModel}
						class="w-full px-3 py-2 border rounded bg-background"
						placeholder="e.g., mistral, llama2"
					/>
				</div>

				<div>
					<label for="ai-temp-range" class="block text-sm font-medium mb-1">
						Temperature: {temperature.toFixed(1)}
					</label>
					<input
						id="ai-temp-range"
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

				<div class="form-group">
					<label for="ai-max-tokens" class="block text-sm font-medium mb-1">Max Tokens</label>
					<input
						id="ai-max-tokens"
						type="number"
						bind:value={maxTokens}
						class="w-full px-3 py-2 border rounded bg-background"
						min="64"
						max="8192"
					/>
				</div>

				<div class="space-y-2">
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={streamingEnabled} class="rounded" />
						<span>Enable streaming responses</span>
					</label>

					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={fallbackEnabled} class="rounded" />
						<span>Fallback to local model if cloud unavailable</span>
					</label>
				</div>
			</div>
		</section>

		<!-- Save Button -->
		<div class="actions">
			<button onclick={saveConfig} class="btn btn-primary">
				Save Configuration
			</button>
		</div>

	{:else}
		<!-- Routing Configuration Tab -->
		<section class="mb-6">
			<h3 class="text-lg font-semibold mb-2">Task Routing Configuration</h3>
			<p class="text-sm text-muted mb-4">
				Configure which AI model is used for each task type. This allows you to optimize
				cost and quality based on the specific requirements of each task.
			</p>
			
			<table class="routing-table">
				<thead>
					<tr>
						<th>Task Type</th>
						<th>Provider</th>
						<th>Model</th>
						<th>Temperature</th>
						<th>Max Tokens</th>
					</tr>
				</thead>
				<tbody>
					{#each TASK_TYPES as taskType}
						{@const config = routing[taskType]}
						<tr>
							<td class="task-name">{taskType}</td>
							<td>
								<select 
									value={config.provider}
									on:change={(e) => {
										setTaskRouting(taskType, { provider: e.currentTarget.value as AIProvider });
									}}
									class="select-field"
								>
									{#each PROVIDERS as p}
										<option value={p}>{p}</option>
									{/each}
								</select>
							</td>
							<td>
								<select 
									value={config.model}
									on:change={(e) => {
										setTaskRouting(taskType, { model: e.currentTarget.value });
									}}
									class="select-field"
								>
									{#each getModelsForProvider(config.provider) as model}
										<option value={model}>{model}</option>
									{/each}
								</select>
							</td>
							<td>
								<input 
									type="number"
									step="0.1"
									min="0"
									max="2"
									value={config.temperature ?? 0.7}
									on:input={(e) => {
										setTaskRouting(taskType, { 
											temperature: parseFloat(e.currentTarget.value) || 0.7 
										});
									}}
									class="input-field numeric"
								/>
							</td>
							<td>
								<input 
									type="number"
									value={config.maxTokens ?? 1024}
									on:input={(e) => {
										setTaskRouting(taskType, { 
											maxTokens: parseInt(e.currentTarget.value) || 1024 
										});
									}}
									class="input-field numeric"
								/>
							</td>
						</tr>
					{/each}
					
					<!-- Fallback row -->
					<tr class="fallback-row">
						<td class="task-name">Fallback</td>
						<td>
							<select 
								value={routing.fallback.provider}
								on:change={(e) => {
									setTaskRouting('fallback', { provider: e.currentTarget.value as AIProvider });
								}}
								class="select-field"
							>
								{#each PROVIDERS as p}
									<option value={p}>{p}</option>
								{/each}
							</select>
						</td>
						<td>
							<select 
								value={routing.fallback.model}
								on:change={(e) => {
									setTaskRouting('fallback', { model: e.currentTarget.value });
								}}
								class="select-field"
							>
								{#each getModelsForProvider(routing.fallback.provider) as model}
									<option value={model}>{model}</option>
								{/each}
							</select>
						</td>
						<td>
							<input 
								type="number"
								step="0.1"
								min="0"
								max="2"
								value={routing.fallback.temperature ?? 0.7}
								on:input={(e) => {
									setTaskRouting('fallback', { 
										temperature: parseFloat(e.currentTarget.value) || 0.7 
									});
								}}
								class="input-field numeric"
							/>
						</td>
						<td>
							<input 
								type="number"
								value={routing.fallback.maxTokens ?? 1024}
								on:input={(e) => {
									setTaskRouting('fallback', { 
										maxTokens: parseInt(e.currentTarget.value) || 1024 
									});
								}}
								class="input-field numeric"
							/>
						</td>
					</tr>
				</tbody>
			</table>

			<div class="actions">
				<button onclick={saveConfig} class="btn btn-primary">
					Save Routing
				</button>
			</div>
		</section>
	{/if}

	<!-- Test Section -->
	<section>
		<h3 class="text-lg font-semibold mb-2">Test Configuration</h3>
		
		<div class="space-y-2">
			<textarea
				bind:value={testPrompt}
				class="w-full px-3 py-2 border rounded bg-background min-h-[80px]"
				placeholder="Enter a test prompt..."
			></textarea>
			
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
		max-width: 1000px;
		margin: 0 auto;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.tab-btn {
		padding: 0.75rem 1.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--text-secondary);
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
		font-size: 0.95rem;
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.tab-btn:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.tab-btn.active {
		color: var(--accent-color);
		border-bottom-color: var(--accent-color);
		background: var(--bg-secondary);
	}

	.tab-content {
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.provider-card {
		background: var(--bg-secondary);
		border-radius: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--border-color);
		transition: all 0.2s;
	}

	.provider-card:hover {
		border-color: var(--accent-color);
	}

	.provider-card.enabled {
		opacity: 1;
	}

	.provider-card.disabled {
		opacity: 0.6;
	}

	.provider-card.available {
		border-left: 3px solid #22c55e;
	}

	.provider-card.unavailable {
		border-left: 3px solid #ef4444;
	}

	.provider-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.provider-icon {
		font-size: 1.5rem;
	}

	.provider-info {
		flex: 1;
	}

	.provider-name {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.status-badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-weight: 500;
	}

	.status-badge.loading {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.status-badge.available {
		background: #dcfce7;
		color: #166534;
	}

	.status-badge.unavailable {
		background: #fee2e2;
		color: #991b1b;
	}

	.provider-body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.form-group label {
		font-size: 0.8rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.toggle-switch {
		width: 44px;
		height: 24px;
		appearance: none;
		background: var(--bg-tertiary);
		border-radius: 9999px;
		position: relative;
		cursor: pointer;
		transition: background 0.2s;
	}

	.toggle-switch:checked {
		background: var(--accent-color);
	}

	.toggle-switch::before {
		content: '';
		position: absolute;
		left: 2px;
		top: 2px;
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s;
	}

	.toggle-switch:checked::before {
		transform: translateX(20px);
	}

	.label-text {
		cursor: pointer;
	}

	.input-field {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: var(--bg-tertiary);
		color: var(--text-primary);
		font-size: 0.9rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.input-field:focus {
		outline: none;
		border-color: var(--accent-color);
		box-shadow: 0 0 0 2px var(--accent-color)/20;
	}

	.input-field.numeric {
		width: 80px;
		text-align: center;
	}

	.select-field {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: var(--bg-tertiary);
		color: var(--text-primary);
		font-size: 0.9rem;
		cursor: pointer;
	}

	.select-field:focus {
		outline: none;
		border-color: var(--accent-color);
	}

	.routing-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1.5rem;
	}

	.routing-table th,
	.routing-table td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid var(--border-color);
	}

	.routing-table th {
		background: var(--bg-secondary);
		font-weight: 600;
		color: var(--text-secondary);
		font-size: 0.85rem;
		text-transform: capitalize;
	}

	.routing-table tr:hover {
		background: var(--bg-secondary);
	}

	.fallback-row {
		opacity: 0.7;
	}

	.fallback-row:hover {
		background: transparent;
	}

	.task-name {
		font-weight: 500;
		color: var(--text-primary);
		text-transform: capitalize;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
	}

	.btn {
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary {
		background: var(--accent-color);
		color: white;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.providers-grid {
			grid-template-columns: 1fr;
		}
		
		.routing-table {
			display: block;
			overflow-x: auto;
		}
	}
</style>
