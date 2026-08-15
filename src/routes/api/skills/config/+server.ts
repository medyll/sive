import { json, error, type RequestHandler } from '@sveltejs/kit';
import { aiService } from '$lib/server/ai/service';
import { aiRouter } from '$lib/server/ai/router';
import type { AIProvider, RoutingConfig, ModelConfig } from '$lib/server/ai/router';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

const PROVIDERS: AIProvider[] = ['ollama', 'anthropic', 'openai', 'gemini'];

/**
 * Per-user, in-memory API key storage.
 *
 * Keys are never written to disk and never leave the server: the GET handler
 * reports only whether a key is configured, never its value. The store is keyed
 * by user id so one account's key is never used for another's requests.
 *
 * This is still process-local and lost on restart. Persisting keys requires
 * encrypted storage and is out of scope here.
 */
const apiKeysByUser = new Map<string, Map<AIProvider, string>>();

function keysFor(userId: string): Map<AIProvider, string> {
	let keys = apiKeysByUser.get(userId);
	if (!keys) {
		keys = new Map();
		apiKeysByUser.set(userId, keys);
	}
	return keys;
}

function requireUserId(locals: App.Locals): string {
	const userId = locals.session && !locals.isGuest ? locals.user?.id : undefined;
	if (!userId) throw error(401, 'Unauthorized');
	return userId;
}

// GET - Get current configuration
export const GET: RequestHandler = async ({ locals }) => {
	const userId = requireUserId(locals);

	try {
		const routerConfig = aiRouter.getRouting();
		const serviceConfig = aiService.getConfig();
		const availableProviders: AIProvider[] = await aiService.getAvailableProviders();
		const userKeys = keysFor(userId);

		// Never include the key itself — only whether one is configured.
		const providersConfig = {
			ollama: {
				enabled: true,
				available: availableProviders.includes('ollama'),
				base_url: 'http://localhost:11434',
				default_model: 'mistral',
				api_key_configured: true // Ollama needs no API key
			},
			anthropic: {
				enabled: false,
				available: availableProviders.includes('anthropic'),
				api_key_configured: !!process.env.ANTHROPIC_API_KEY || userKeys.has('anthropic')
			},
			openai: {
				enabled: false,
				available: availableProviders.includes('openai'),
				api_key_configured: !!process.env.OPENAI_API_KEY || userKeys.has('openai')
			},
			gemini: {
				enabled: false,
				available: availableProviders.includes('gemini'),
				api_key_configured: !!process.env.GEMINI_API_KEY || userKeys.has('gemini')
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
export const POST: RequestHandler = async (event) => {
	const { request, locals } = event;
	const userId = requireUserId(locals);

	const limit = checkWriteRateLimit(event);
	if (!limit.allowed) return limit.response!;

	try {
		const body = await request.json();
		const { routing, providers, service_config } = body;

		// Update routing configuration
		if (routing) {
			const updates: Partial<RoutingConfig> = {};
			for (const [taskType, config] of Object.entries(routing)) {
				if (config && (config as ModelConfig).provider) {
					updates[taskType as keyof RoutingConfig] = config as ModelConfig;
				}
			}
			aiRouter.updateRouting(updates);
		}

		// Update this user's API keys (in memory only, never echoed back)
		if (providers) {
			const userKeys = keysFor(userId);
			for (const [providerName, providerConfig] of Object.entries(providers)) {
				const provider = providerName as AIProvider;
				if (!PROVIDERS.includes(provider)) continue;

				const { apiKey } = providerConfig as { apiKey?: string };
				if (apiKey === undefined) continue;

				if (apiKey) userKeys.set(provider, apiKey);
				else userKeys.delete(provider);
			}
		}

		// Update service configuration
		if (service_config) {
			aiService.updateConfig(service_config);
		}

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
