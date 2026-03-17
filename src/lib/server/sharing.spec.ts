import { describe, it, expect } from 'vitest';
import { createShareLink, resolveShareLink, revokeShareLink, getDocShareLinks } from './sharing';

const DOC = 'doc-share-1';
const USER = 'user-share-1';
const USER2 = 'user-share-2';

describe('createShareLink', () => {
	it('returns a link with a token', () => {
		const link = createShareLink(DOC, USER);
		expect(link.token).toHaveLength(32);
		expect(link.docId).toBe(DOC);
		expect(link.revoked).toBe(false);
	});

	it('sets expiresAt when ttlHours given', () => {
		const link = createShareLink(DOC, USER, 24);
		expect(link.expiresAt).not.toBeNull();
		const exp = new Date(link.expiresAt!).getTime();
		expect(exp).toBeGreaterThan(Date.now());
	});

	it('expiresAt is null when no ttl', () => {
		const link = createShareLink(DOC, USER);
		expect(link.expiresAt).toBeNull();
	});
});

describe('resolveShareLink', () => {
	it('resolves a valid link', () => {
		const link = createShareLink(DOC, USER);
		expect(resolveShareLink(link.token)).not.toBeNull();
	});

	it('returns null for unknown token', () => {
		expect(resolveShareLink('nonexistent')).toBeNull();
	});

	it('returns null for revoked link', () => {
		const link = createShareLink(DOC, USER);
		revokeShareLink(link.token, USER);
		expect(resolveShareLink(link.token)).toBeNull();
	});

	it('returns null for expired link', () => {
		const link = createShareLink(DOC, USER, -1); // expired 1h ago
		expect(resolveShareLink(link.token)).toBeNull();
	});
});

describe('revokeShareLink', () => {
	it('revokes own link', () => {
		const link = createShareLink(DOC, USER);
		expect(revokeShareLink(link.token, USER)).toBe(true);
	});

	it('does not revoke another user\'s link', () => {
		const link = createShareLink(DOC, USER);
		expect(revokeShareLink(link.token, USER2)).toBe(false);
	});
});

describe('getDocShareLinks', () => {
	it('returns only non-revoked links for doc+user', () => {
		const D = 'doc-share-list';
		const l1 = createShareLink(D, USER);
		createShareLink(D, USER);
		revokeShareLink(l1.token, USER);
		const links = getDocShareLinks(D, USER);
		expect(links.every((l) => !l.revoked)).toBe(true);
		expect(links).toHaveLength(1);
	});
});
