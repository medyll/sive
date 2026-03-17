import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getVersions, getVersion, restoreVersion, labelVersion } from '$lib/server/versions';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const docId = url.searchParams.get('docId');
	if (!docId) return json({ error: 'docId required' }, { status: 400 });
	return json(getVersions(docId));
};

export const POST: RequestHandler = async (event) => {
	const { locals, request, url } = event;
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const limited = await checkWriteRateLimit(event);
	if (!limited.allowed) return limited.response!;

	const action = url.searchParams.get('action');
	const body = await request.json().catch(() => null);

	if (action === 'restore') {
		const { docId, versionId } = body ?? {};
		if (!docId || !versionId) return json({ error: 'docId and versionId required' }, { status: 400 });
		const result = restoreVersion(docId, versionId);
		if (!result) return json({ error: 'Version not found' }, { status: 404 });
		return json(result);
	}

	if (action === 'label') {
		const { docId, versionId, label } = body ?? {};
		if (!docId || !versionId) return json({ error: 'docId and versionId required' }, { status: 400 });
		const ok = labelVersion(docId, versionId, String(label ?? '').slice(0, 80));
		if (!ok) return json({ error: 'Version not found' }, { status: 404 });
		return json({ ok: true });
	}

	return json({ error: 'Unknown action' }, { status: 400 });
};
