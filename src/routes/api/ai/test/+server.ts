import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/server/ai/service';
import type { AIProvider } from '$lib/server/ai/router';

const PROVIDERS: AIProvider[] = ['ollama', 'anthropic', 'openai', 'gemini'];

/**
 * POST /api/ai/test — Run a one-off prompt against a chosen provider
 *
 * Backs the "test connection" button in the AI settings panel. Exists so the
 * settings UI never has to import the server-side AI service directly.
 *
 * Request body:
 * - prompt: string — the prompt to send
 * - provider: AIProvider — which provider to exercise
 * - temperature, maxTokens: optional model overrides
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || locals.isGuest) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json().catch(() => ({}));
	const { prompt, provider, temperature, maxTokens } = body;

	if (!prompt || typeof prompt !== 'string') {
		return json({ error: 'Prompt required' }, { status: 400 });
	}

	if (!PROVIDERS.includes(provider)) {
		return json({ error: 'Unknown provider' }, { status: 400 });
	}

	try {
		const response = await aiService.generate({
			prompt,
			provider,
			taskType: 'chat',
			config: { temperature, maxTokens }
		});

		return json({
			content: response.content,
			provider: response.provider,
			model: response.model,
			duration_ms: response.duration_ms
		});
	} catch (error) {
		console.error('[AI test] generation failed:', error);
		const message = error instanceof Error ? error.message : 'AI request failed';
		return json({ error: message }, { status: 502 });
	}
};
