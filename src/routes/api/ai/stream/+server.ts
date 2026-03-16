import type { RequestHandler } from './$types';

const STUB_REPLY = "I'm your AI writing assistant. I can help you with plot, characters, style, and more. What would you like to explore?";
const STUB_REPLY_WITH_CTX = "I can see your document. I'm your AI writing assistant — ask me anything about the text you're working on.";

const BASE_SYSTEM = 'You are an AI writing assistant for fiction authors. Be concise and helpful.';
const MAX_CTX_CHARS = 2000;

function buildSystemPrompt(docContext: string): string {
	if (!docContext) return BASE_SYSTEM;
	const excerpt = docContext.slice(0, MAX_CTX_CHARS);
	return (
		BASE_SYSTEM +
		`\n\nThe user is currently writing the following document excerpt:\n\n<document>\n${excerpt}\n</document>\n\nUse it as context when answering. Do not repeat it back verbatim.`
	);
}

function encodeSSE(chunk: string): Uint8Array {
	return new TextEncoder().encode(`data: ${chunk}\n\n`);
}

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const ctxParam = url.searchParams.get('ctx') ?? '';

	let messages: Array<{ role: string; text: string }> = [];
	try {
		messages = JSON.parse(atob(q));
	} catch {
		// malformed — use empty
	}

	let docContext = '';
	if (ctxParam) {
		try {
			docContext = atob(ctxParam);
		} catch {
			// malformed ctx — ignore
		}
	}

	const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

	// No API key → stream stub reply word by word
	if (!apiKey) {
		const stubText = docContext ? STUB_REPLY_WITH_CTX : STUB_REPLY;
		const words = stubText.split(' ');
		const stream = new ReadableStream({
			async start(controller) {
				for (const word of words) {
					controller.enqueue(encodeSSE(word + ' '));
					await new Promise((r) => setTimeout(r, 30));
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

	// Real Anthropic streaming
	const { default: Anthropic } = await import('@anthropic-ai/sdk');
	const client = new Anthropic({ apiKey });
	const systemPrompt = buildSystemPrompt(docContext);

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const anthropicStream = await client.messages.stream({
					model: 'claude-haiku-4-5',
					max_tokens: 512,
					system: systemPrompt,
					messages: messages.map((m) => ({
						role: m.role as 'user' | 'assistant',
						content: m.text
					}))
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
				console.error('[/api/ai/stream] Error:', err);
				controller.enqueue(encodeSSE('Sorry, an error occurred. Please try again.'));
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
