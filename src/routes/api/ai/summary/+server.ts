import type { RequestHandler } from './$types';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

const MAX_CTX_CHARS = 2000;

const LENGTH_INSTRUCTIONS: Record<string, string> = {
	short: 'Write a 1-2 sentence summary.',
	medium: 'Write a concise paragraph summary (3-5 sentences).',
	long: 'Write a detailed summary of 2-3 paragraphs covering the main themes, characters, and events.'
};

const STUB_SUMMARIES: Record<string, string> = {
	short: 'This document tells a compelling story with vivid characters and rich detail.',
	medium:
		'This document presents a rich narrative with well-developed characters navigating complex situations. The author weaves themes of conflict and resolution throughout, creating a cohesive and engaging story. The writing style is clear and evocative.',
	long: 'This document is a carefully crafted piece of fiction that explores the human condition through a series of interconnected events and richly drawn characters. The author demonstrates a strong command of narrative structure, building tension effectively while maintaining reader engagement throughout.\n\nThe themes explored include perseverance, identity, and the complexity of relationships. Characters are rendered with psychological depth, and their motivations feel authentic and grounded. The setting is described with enough detail to create immersion without overwhelming the narrative.\n\nOverall, this is a polished piece of work that balances literary ambition with accessible storytelling.'
};

function encodeSSE(chunk: string): Uint8Array {
	return new TextEncoder().encode(`data: ${chunk}\n\n`);
}

export const GET: RequestHandler = async (event) => {
	// Rate limit check (heavy AI computation)
	const limit = checkWriteRateLimit(event);
	if (!limit.allowed) return limit.response!;

	const { url } = event;
	const ctxParam = url.searchParams.get('ctx') ?? '';
	const length = (url.searchParams.get('length') ?? 'medium') as 'short' | 'medium' | 'long';

	let docContext = '';
	if (ctxParam) {
		try {
			docContext = atob(ctxParam);
		} catch {
			// malformed ctx — ignore
		}
	}

	const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

	if (!apiKey) {
		// Stream stub word by word
		const stubText = STUB_SUMMARIES[length] ?? STUB_SUMMARIES.medium;
		const words = stubText.split(' ');
		const stream = new ReadableStream({
			async start(controller) {
				for (const word of words) {
					controller.enqueue(encodeSSE(word + ' '));
					await new Promise((r) => setTimeout(r, 25));
				}
				controller.enqueue(encodeSSE('[DONE]'));
				controller.close();
			}
		});
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	}

	const excerpt = docContext.slice(0, MAX_CTX_CHARS);
	const instruction = LENGTH_INSTRUCTIONS[length] ?? LENGTH_INSTRUCTIONS.medium;
	const systemPrompt =
		'You are a literary assistant that summarises fiction documents. Be accurate, concise, and do not invent details not present in the text.';
	const userMessage = excerpt
		? `Here is the document excerpt:\n\n<document>\n${excerpt}\n</document>\n\n${instruction}`
		: `No document content was provided. ${instruction} Respond with a placeholder indicating no content is available.`;

	const { default: Anthropic } = await import('@anthropic-ai/sdk');
	const client = new Anthropic({ apiKey });

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const anthropicStream = await client.messages.stream({
					model: 'claude-haiku-4-5',
					max_tokens: 512,
					system: systemPrompt,
					messages: [{ role: 'user', content: userMessage }]
				});

				for await (const event of anthropicStream) {
					if (
						event.type === 'content_block_delta' &&
						event.delta.type === 'text_delta'
					) {
						controller.enqueue(encodeSSE(event.delta.text));
					}
				}
				controller.enqueue(encodeSSE('[DONE]'));
			} catch (err) {
				console.error('[/api/ai/summary] Error:', err);
				controller.enqueue(encodeSSE('Sorry, an error occurred generating the summary.'));
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
