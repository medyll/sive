import type { RequestHandler } from './$types';
import { buildEpubBytes } from '$lib/server/exportFormats';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

export const POST: RequestHandler = async (event) => {
	if (!event.locals.user) return new Response('Unauthorized', { status: 401 });
	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const { title = 'Document', content = '', author = '' } = await event.request.json().catch(() => ({}));
	const bytes = buildEpubBytes(String(title), String(content), String(author));
	const slug = title.slice(0, 40).replace(/[^a-z0-9]+/gi, '-').toLowerCase();

	return new Response(Buffer.from(bytes), {
		headers: {
			'Content-Type': 'application/epub+zip',
			'Content-Disposition': `attachment; filename="${slug}.epub"`
		}
	});
};
