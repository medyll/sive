import type { RequestHandler } from './$types';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

const MAX_CTX_CHARS = 2000;

const STUB_OUTLINE_TOPIC = `## Introduction
### Background
### Key Themes
## Part One — The Setup
### Chapter 1: The Beginning
### Chapter 2: Rising Tension
## Part Two — The Conflict
### Chapter 3: The Turning Point
### Chapter 4: Complications
## Part Three — Resolution
### Chapter 5: The Climax
### Chapter 6: Denouement
## Conclusion`;

const STUB_OUTLINE_DOC = `## Document Overview
### Opening Section
### Core Argument
## Main Body
### First Key Point
### Second Key Point
### Supporting Evidence
## Conclusion
### Summary
### Next Steps`;

function encodeSSE(chunk: string): Uint8Array {
	return new TextEncoder().encode(`data: ${chunk}\n\n`);
}

function buildOutlinePrompt(topic: string, docContext: string): string {
	if (docContext) {
		const excerpt = docContext.slice(0, MAX_CTX_CHARS);
		return `Analyse the following document excerpt and generate a structured outline using markdown headings (## for sections, ### for subsections). Return only the outline — no preamble or explanation.\n\n<document>\n${excerpt}\n</document>`;
	}
	return `Generate a structured outline for the following topic using markdown headings (## for sections, ### for subsections). Return only the outline — no preamble or explanation.\n\nTopic: ${topic}`;
}

export const GET: RequestHandler = async (event) => {
	const limit = checkWriteRateLimit(event);
	if (!limit.allowed) return limit.response!;

	const { url } = event;
	const topic = url.searchParams.get('topic') ?? '';
	const ctxParam = url.searchParams.get('ctx') ?? '';

	let docContext = '';
	if (ctxParam) {
		try { docContext = atob(ctxParam); } catch { /* ignore */ }
	}

	const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

	// No API key → stream stub outline
	if (!apiKey) {
		const stubText = docContext ? STUB_OUTLINE_DOC : STUB_OUTLINE_TOPIC;
		const lines = stubText.split('\n');
		const stream = new ReadableStream({
			async start(controller) {
				for (const line of lines) {
					controller.enqueue(encodeSSE(line + '\n'));
					await new Promise((r) => setTimeout(r, 40));
				}
				controller.enqueue(encodeSSE('[DONE]'));
				controller.close();
			}
		});
		return new Response(stream, {
			headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' }
		});
	}

	// Real Anthropic streaming
	const { default: Anthropic } = await import('@anthropic-ai/sdk');
	const client = new Anthropic({ apiKey });
	const userPrompt = buildOutlinePrompt(topic, docContext);

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const anthropicStream = await client.messages.stream({
					model: 'claude-haiku-4-5',
					max_tokens: 512,
					messages: [{ role: 'user', content: userPrompt }]
				});
				for await (const ev of anthropicStream) {
					if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
						controller.enqueue(encodeSSE(ev.delta.text));
					}
				}
				controller.enqueue(encodeSSE('[DONE]'));
			} catch (err) {
				console.error('[/api/ai/outline] Error:', err);
				controller.enqueue(encodeSSE('[DONE]'));
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' }
	});
};
