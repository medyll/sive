/**
 * Skills API - Configuration Endpoint
 * 
 * Get or update AI configuration including provider settings and routing.
 * 
 * GET /api/skills/config - Get current configuration
 * POST /api/skills/config - Update configuration
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

import { json, error, type RequestHandler } from '@sveltejs/kit';
import { aiRouter, aiService, type AIProvider } from '$lib/server/ai';
import type { RoutingConfig, ModelConfig } from '$lib/server/ai/router';

// GET - Get current configuration
export const GET: RequestHandler = async () => {
  try {
    const routerConfig = aiRouter.getRouting();
    const serviceConfig = aiService.getConfig();

    const availableProviders: AIProvider[] = await aiService.getAvailableProviders();

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
      providers: {
        ollama: {
          enabled: true,
          available: availableProviders.includes('ollama'),
          base_url: 'http://localhost:11434',
          default_model: 'mistral'
        },
        anthropic: {
          enabled: false,
          available: availableProviders.includes('anthropic'),
          api_key_configured: !!process.env.ANTHROPIC_API_KEY
        },
        openai: {
          enabled: false,
          available: availableProviders.includes('openai'),
          api_key_configured: !!process.env.OPENAI_API_KEY
        },
        gemini: {
          enabled: false,
          available: availableProviders.includes('gemini'),
          api_key_configured: !!process.env.GEMINI_API_KEY
        }
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
    console.error('[Skills API] Config GET error:', err);
    return error(500, { message: errorMessage });
  }
};

// POST - Update configuration
export const POST: RequestHandler = async ({ request }) => {
  try {
    const {
      routing,
      providers,
      service_config
    } = await request.json();

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
