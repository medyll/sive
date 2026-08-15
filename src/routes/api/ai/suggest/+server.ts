import type { RequestHandler } from './$types';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';
import { validateAIPrompt } from '$lib/server/inputValidation';

type SuggestionMode = 'complete' | 'rewrite' | 'tone' | 'expand' | 'condense';

const MAX_CTX_CHARS = 3000;

function buildSystemPrompt(mode: SuggestionMode): string {
	switch (mode) {
		case 'complete':
			return `You are an AI writing assistant helping a fiction author. Continue the text naturally from where it ends. Write 1-3 sentences that flow seamlessly from the existing prose. Match the author's voice, style, and tone exactly. Do not add titles, headings, or commentary — just continue the prose.`;
		case 'rewrite':
			return `You are an AI writing assistant. Rewrite the provided text to improve clarity, flow, and impact while preserving the original meaning and intent. Match the surrounding tone. Return only the rewritten text with no commentary.`;
		case 'tone':
			return `You are an AI writing assistant. Adjust the tone of the provided text to be more vivid and evocative — use stronger verbs, more specific nouns, and sensory details. Preserve the meaning. Return only the adjusted text.`;
		case 'expand':
			return `You are an AI writing assistant. Expand the provided text with more detail, imagery and development, while preserving its meaning, voice and tense. Return only the expanded text with no commentary.`;
		case 'condense':
			return `You are an AI writing assistant. Condense the provided text: keep every essential idea, cut redundancy and filler, preserve the author's voice. Return only the condensed text with no commentary.`;
	}
}

function buildUserMessage(mode: SuggestionMode, ctx: string, selection: string): string {
	const excerpt = ctx.slice(-MAX_CTX_CHARS);
	switch (mode) {
		case 'complete':
			return `Continue this text:\n\n${excerpt}`;
		case 'rewrite':
			return `Rewrite this passage:\n\n${selection || excerpt}`;
		case 'tone':
			return `Make this more vivid and evocative:\n\n${selection || excerpt}`;
	}
}

function encodeSSE(chunk: string): Uint8Array {
	return new TextEncoder().encode(`data: ${chunk}\n\n`);
}

export const GET: RequestHandler = async (event) => {
	const limit = checkWriteRateLimit(event);
	if (!limit.allowed) return limit.response!;

	const { url } = event;
	const ctxParam = url.searchParams.get('ctx') ?? '';
	const modeParam = (url.searchParams.get('mode') ?? 'complete') as SuggestionMode;
	const selectionParam = url.searchParams.get('sel') ?? '';

	if (!['complete', 'rewrite', 'tone', 'expand', 'condense'].includes(modeParam)) {
		return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 });
	}

	let ctx = '';
	if (ctxParam) {
		try {
			ctx = atob(ctxParam);
		} catch {
			// malformed — ignore
		}
	}

	let selection = '';
	if (selectionParam) {
		try {
			selection = atob(selectionParam);
		} catch {
			// malformed — ignore
		}
	}

	// Validate the context as a prompt
	if (ctx) {
		const validation = validateAIPrompt(ctx.slice(-5000));
		if (!validation.valid) {
			return new Response(JSON.stringify({ error: validation.error }), { status: 400 });
		}
	}

	const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

	// No provider configured. This endpoint streams prose straight into the
	// author's editor, so it must say so rather than stream invented text that
	// reads exactly like a real suggestion.
	if (!apiKey) {
		return new Response(
			JSON.stringify({ error: 'No AI provider configured. Set an API key in Settings.' }),
			{ status: 503, headers: { 'Content-Type': 'application/json' } }
		);
	}

	// Real Anthropic streaming
	const { default: Anthropic } = await import('@anthropic-ai/sdk');
	const client = new Anthropic({ apiKey });

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const anthropicStream = await client.messages.stream({
					model: 'claude-haiku-4-5',
					max_tokens: 256,
					system: buildSystemPrompt(modeParam),
					messages: [{ role: 'user', content: buildUserMessage(modeParam, ctx, selection) }]
				});

				for await (const ev of anthropicStream) {
					if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
						controller.enqueue(encodeSSE(ev.delta.text));
					}
				}
				controller.enqueue(encodeSSE('[DONE]'));
			} catch (err) {
				console.error('[/api/ai/suggest] Error:', err);
				controller.enqueue(encodeSSE('[DONE]'));
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
