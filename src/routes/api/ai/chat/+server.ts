import type { RequestHandler } from './$types';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) return new Response('Unauthorized', { status: 401 });
	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const { url } = event;
	const q = url.searchParams.get('q') ?? '';
	const ctxB64 = url.searchParams.get('ctx') ?? '';
	const history = url.searchParams.get('history') ?? '';

	if (!q.trim()) return new Response('q required', { status: 400 });

	let docContext = '';
	try { docContext = decodeURIComponent(escape(atob(ctxB64))); } catch { /* ignore */ }

	const systemPrompt = [
		'You are a helpful writing assistant. The user is working on a document.',
		docContext ? `\n\nDocument content (excerpt):\n${docContext}` : '',
		history ? `\n\nConversation so far:\n${history}` : ''
	].join('');

	const stream = new ReadableStream({
		async start(controller) {
			const enc = new TextEncoder();
			try {
				const response = await client.messages.stream({
					model: 'claude-haiku-4-5-20251001',
					max_tokens: 1024,
					system: systemPrompt,
					messages: [{ role: 'user', content: q }]
				});

				for await (const chunk of response) {
					if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
						controller.enqueue(enc.encode(`data: ${JSON.stringify(chunk.delta.text)}\n\n`));
					}
				}
				controller.enqueue(enc.encode('data: [DONE]\n\n'));
			} catch {
				controller.enqueue(enc.encode('data: [DONE]\n\n'));
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
	});
};
