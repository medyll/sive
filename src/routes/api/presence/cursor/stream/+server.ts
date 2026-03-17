import type { RequestHandler } from './$types';
import { subscribeCursors, getCursors } from '../+server';

export const GET: RequestHandler = async ({ url, request, locals }) => {
	const docId = url.searchParams.get('docId');
	if (!docId) return new Response('docId required', { status: 400 });

	const userId = locals.user?.id ?? null;

	const stream = new ReadableStream({
		start(controller) {
			const enc = new TextEncoder();

			function send(event: string, data: unknown) {
				controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
			}

			// Send current cursors on connect (exclude own)
			const current = getCursors(docId).filter((c) => c.userId !== userId);
			send('init', current);

			// Subscribe to updates
			const unsub = subscribeCursors(docId, (entry) => {
				if (entry.userId === userId) return; // don't echo own cursor
				send('cursor', entry);
			});

			// Heartbeat every 15s
			const hb = setInterval(() => {
				try { controller.enqueue(enc.encode(': heartbeat\n\n')); } catch { /* closed */ }
			}, 15_000);

			request.signal.addEventListener('abort', () => {
				unsub();
				clearInterval(hb);
				try { controller.close(); } catch { /* already closed */ }
			});
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
