export interface Version {
	id: string;
	docId: string;
	userId: string;
	content: string;
	title: string;
	createdAt: string;
	label?: string;
}

export type VersionMeta = Omit<Version, 'content'> & { wordCount: number };

const MAX_VERSIONS = 50;
const store = new Map<string, Version[]>();

function getList(docId: string): Version[] {
	if (!store.has(docId)) store.set(docId, []);
	return store.get(docId)!;
}

export function saveVersion(
	docId: string,
	userId: string,
	content: string,
	title: string,
	label?: string
): Version {
	const list = getList(docId);
	const version: Version = {
		id: crypto.randomUUID(),
		docId,
		userId,
		content,
		title,
		createdAt: new Date().toISOString(),
		label
	};
	list.unshift(version); // newest first
	if (list.length > MAX_VERSIONS) list.splice(MAX_VERSIONS);
	return version;
}

export function getVersions(docId: string): VersionMeta[] {
	return getList(docId).map(({ content, ...meta }) => ({
		...meta,
		wordCount: content.trim() ? content.trim().split(/\s+/).length : 0
	}));
}

export function getVersion(docId: string, versionId: string): Version | undefined {
	return getList(docId).find((v) => v.id === versionId);
}

export function restoreVersion(
	docId: string,
	versionId: string
): { content: string; title: string } | null {
	const v = getVersion(docId, versionId);
	if (!v) return null;
	return { content: v.content, title: v.title };
}

export function labelVersion(docId: string, versionId: string, label: string): boolean {
	const v = getVersion(docId, versionId);
	if (!v) return false;
	v.label = label;
	return true;
}
