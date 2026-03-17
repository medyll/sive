import type { RequestHandler } from './$types';
import { buildDocxBytes } from '$lib/server/exportFormats';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

export const POST: RequestHandler = async (event) => {
	if (!event.locals.user) return new Response('Unauthorized', { status: 401 });
	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const { title = 'Document', content = '' } = await event.request.json().catch(() => ({}));
	const bytes = buildDocxBytes(String(title), String(content));
	const slug = title.slice(0, 40).replace(/[^a-z0-9]+/gi, '-').toLowerCase();

	return new Response(bytes, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'Content-Disposition': `attachment; filename="${slug}.docx"`
		}
	});
};
