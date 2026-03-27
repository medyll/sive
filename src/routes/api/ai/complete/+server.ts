import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * POST /api/ai/complete — Get AI completion for ghost text
 * 
 * Request body:
 * - prompt: string — The text before cursor
 * - context: string — Optional document context
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json().catch(() => ({}));
	const { prompt, context = '' } = body;

	if (!prompt || typeof prompt !== 'string') {
		return json({ error: 'Prompt required' }, { status: 400 });
	}

	try {
		// Build prompt for completion
		const systemPrompt = 'You are a writing assistant. Complete the text naturally. Return ONLY the completion, no explanations.';
		
		const userPrompt = context 
			? `Context:\n${context}\n\nComplete this text:\n${prompt}`
			: `Complete this text:\n${prompt}`;

		const response = await anthropic.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 100,
			system: systemPrompt,
			messages: [
				{ role: 'user', content: userPrompt }
			]
		});

		const completion = response.content[0].type === 'text' 
			? response.content[0].text 
			: '';

		return json({ completion: completion.trim() });
	} catch (error) {
		console.error('AI completion error:', error);
		return json({ error: 'AI completion failed' }, { status: 500 });
	}
};
