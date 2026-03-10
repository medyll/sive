import { error } from '@sveltejs/kit';
import { getDocumentRole } from './shares';
import type { DocumentRole } from './shares';

const ROLE_ORDER: DocumentRole[] = ['viewer', 'editor', 'owner'];

function roleRank(role: DocumentRole): number {
	return ROLE_ORDER.indexOf(role);
}

/**
 * Verifies that the authenticated user holds at least `minimumRole` on the
 * given document. Throws a SvelteKit `error(403)` if access is insufficient,
 * or `error(401)` if no user is authenticated.
 *
 * @returns The user's actual DocumentRole
 */
export async function requireDocumentRole(
	db: unknown,
	userId: string | undefined,
	documentId: string,
	minimumRole: DocumentRole
): Promise<DocumentRole> {
	if (!userId) throw error(401, 'Unauthorized');

	const role = await getDocumentRole(db, userId, documentId);

	if (!role) throw error(403, 'Forbidden: you do not have access to this document');

	if (roleRank(role) < roleRank(minimumRole)) {
		throw error(403, `Forbidden: requires ${minimumRole} role, you have ${role}`);
	}

	return role;
}
