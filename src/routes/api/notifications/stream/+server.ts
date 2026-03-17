import type { RequestHandler } from './$types';
import { getUnread, subscribe } from '$lib/server/notifications';

const HEARTBEAT_INTERVAL_MS = 30_000;

function enc(data: unknown): Uint8Array {
	return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

/** GET /api/notifications/stream — SSE real-time push */
export const GET: RequestHandler = async (event) => {
	const userId = event.locals.user?.id ?? null;

	if (!userId || userId === 'guest') {
		return new Response('data: {"error":"not_authenticated"}\n\n', {
			status: 401,
			headers: { 'Content-Type': 'text/event-stream' }
		});
	}

	const stream = new ReadableStream({
		start(controller) {
			// Send current unread state on connect
			const { count, notifications } = getUnread(userId);
			controller.enqueue(enc({ type: 'init', unreadCount: count, notifications }));

			// Subscribe to live pushes
			const unsubscribe = subscribe(userId, (notification) => {
				try {
					controller.enqueue(enc({ type: 'notification', notification }));
				} catch {
					// Stream may have closed
				}
			});

			// Heartbeat to keep connection alive
			const heartbeat = setInterval(() => {
				try {
					controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
				} catch {
					clearInterval(heartbeat);
					unsubscribe();
				}
			}, HEARTBEAT_INTERVAL_MS);

			// Cleanup on close
			event.request.signal.addEventListener('abort', () => {
				clearInterval(heartbeat);
				unsubscribe();
				try { controller.close(); } catch { /* already closed */ }
			});
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
