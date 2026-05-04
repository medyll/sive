import { json, error, type RequestHandler } from '@sveltejs/kit';
import { aiRouter, aiService, type AIProvider } from '$lib/server/ai/service';
import type { RoutingConfig, ModelConfig } from '$lib/server/ai/router';

// In-memory storage for API keys (in production, use database or secure storage)
// Note: This is a simple in-memory store - API keys are NOT persisted to disk
// For production, implement proper secure storage
const apiKeyStore = new Map<AIProvider, string>();

// GET - Get current configuration
export const GET: RequestHandler = async () => {
	try {
		const routerConfig = aiRouter.getRouting();
		const serviceConfig = aiService.getConfig();

		const availableProviders: AIProvider[] = await aiService.getAvailableProviders();

		// Build provider config including stored API keys
		const providersConfig: Record<AIProvider, {
			enabled: boolean;
			available: boolean;
			apiKey?: string;
			endpoint?: string;
			base_url?: string;
			default_model?: string;
			api_key_configured?: boolean;
		}> = {
			ollama: {
				enabled: true,
				available: availableProviders.includes('ollama'),
				base_url: 'http://localhost:11434',
				default_model: 'mistral',
				// Ollama doesn't need API key
				enabled: true
			},
			anthropic: {
				enabled: false,
				available: availableProviders.includes('anthropic'),
				apiKey: apiKeyStore.get('anthropic') || undefined,
				api_key_configured: !!process.env.ANTHROPIC_API_KEY || !!apiKeyStore.get('anthropic')
			},
			openai: {
				enabled: false,
				available: availableProviders.includes('openai'),
				apiKey: apiKeyStore.get('openai') || undefined,
				api_key_configured: !!process.env.OPENAI_API_KEY || !!apiKeyStore.get('openai')
			},
			gemini: {
				enabled: false,
				available: availableProviders.includes('gemini'),
				apiKey: apiKeyStore.get('gemini') || undefined,
				api_key_configured: !!process.env.GEMINI_API_KEY || !!apiKeyStore.get('gemini')
			}
		};

		return json({
			success: true,
			routing: {
				coherence: routerConfig.coherence,
				style: routerConfig.style,
				review: routerConfig.review,
				suggestions: routerConfig.suggestions,
				chat: routerConfig.chat,
				fallback: routerConfig.fallback
			},
			providers: providersConfig,
			service_config: {
				defaultProvider: serviceConfig.defaultProvider,
				enableFallback: serviceConfig.enableFallback,
				streamingEnabled: serviceConfig.streamingEnabled,
				maxRetries: serviceConfig.maxRetries
			}
		});
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		console.error('[Skills API] Config GET error:', err);
		return error(500, { message: errorMessage });
	}
};

// POST - Update configuration
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { routing, providers, service_config } = body;

		// Update routing configuration
		if (routing) {
			const updates: Partial<RoutingConfig> = {};
			for (const [taskType, config] of Object.entries(routing)) {
				if (config && config.provider) {
					updates[taskType as keyof RoutingConfig] = config as ModelConfig;
				}
			}
			aiRouter.updateRouting(updates);
		}

		// Update provider API keys (stored in memory only)
		if (providers) {
			for (const [providerName, providerConfig] of Object.entries(providers)) {
				const provider = providerName as AIProvider;
				if (providerConfig.apiKey !== undefined) {
					// Store API key in memory (not persisted)
					if (providerConfig.apiKey) {
						apiKeyStore.set(provider, providerConfig.apiKey);
					} else {
						apiKeyStore.delete(provider);
					}
				}
				if (providerConfig.enabled !== undefined) {
					// Enable/disable provider in router
					// Note: This would need to be handled by the service
				}
			}
		}

		// Update service configuration
		if (service_config) {
			aiService.updateConfig(service_config);
		}

		// Get updated configuration
		const routerConfig = aiRouter.getRouting();
		const serviceConfig = aiService.getConfig();

		return json({
			success: true,
			message: 'Configuration updated successfully',
			routing: {
				coherence: routerConfig.coherence,
				style: routerConfig.style,
				review: routerConfig.review,
				suggestions: routerConfig.suggestions,
				chat: routerConfig.chat,
				fallback: routerConfig.fallback
			},
			service_config: {
				defaultProvider: serviceConfig.defaultProvider,
				enableFallback: serviceConfig.enableFallback,
				streamingEnabled: serviceConfig.streamingEnabled,
				maxRetries: serviceConfig.maxRetries
			}
		});
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		console.error('[Skills API] Config POST error:', err);
		return error(500, { message: errorMessage });
	}
};
