import { describe, it, expect } from 'vitest';
import { isApiRoute, isPublicApiRoute, shouldDenyApiRequest } from './apiGuard';

const authed = { authAvailable: true, hasSession: true, isGuest: false };
const anon = { authAvailable: true, hasSession: false, isGuest: true };

describe('isApiRoute', () => {
	it('matches /api and everything under it', () => {
		expect(isApiRoute('/api')).toBe(true);
		expect(isApiRoute('/api/stats')).toBe(true);
		expect(isApiRoute('/api/skills/config')).toBe(true);
	});

	it('does not match page routes', () => {
		expect(isApiRoute('/')).toBe(false);
		expect(isApiRoute('/settings')).toBe(false);
	});

	it('does not match a path that merely starts with the letters api', () => {
		expect(isApiRoute('/apixyz')).toBe(false);
	});
});

describe('isPublicApiRoute', () => {
	it('allows the better-auth handler and its subpaths', () => {
		expect(isPublicApiRoute('/api/auth')).toBe(true);
		expect(isPublicApiRoute('/api/auth/callback/github')).toBe(true);
	});

	it('allows the guest endpoints', () => {
		expect(isPublicApiRoute('/api/guest/status')).toBe(true);
		expect(isPublicApiRoute('/api/guest/convert')).toBe(true);
	});

	it('does not allow anything else', () => {
		expect(isPublicApiRoute('/api/skills/config')).toBe(false);
		expect(isPublicApiRoute('/api/ai')).toBe(false);
	});

	it('does not allow a prefix match that is not a path boundary', () => {
		expect(isPublicApiRoute('/api/authorize-everything')).toBe(false);
	});
});

describe('shouldDenyApiRequest', () => {
	it('denies anonymous access to a protected endpoint', () => {
		expect(shouldDenyApiRequest({ pathname: '/api/skills/config', ...anon })).toBe(true);
	});

	it('denies the stub guest identity even though locals.user is set', () => {
		expect(
			shouldDenyApiRequest({
				pathname: '/api/ai',
				authAvailable: true,
				hasSession: false,
				isGuest: true
			})
		).toBe(true);
	});

	it('allows an authenticated session', () => {
		expect(shouldDenyApiRequest({ pathname: '/api/skills/config', ...authed })).toBe(false);
	});

	it('allows public routes without a session', () => {
		expect(shouldDenyApiRequest({ pathname: '/api/guest/status', ...anon })).toBe(false);
		expect(shouldDenyApiRequest({ pathname: '/api/auth/sign-in', ...anon })).toBe(false);
	});

	it('never denies page routes', () => {
		expect(shouldDenyApiRequest({ pathname: '/', ...anon })).toBe(false);
		expect(shouldDenyApiRequest({ pathname: '/settings', ...anon })).toBe(false);
	});

	it('stands down when no auth backend is available (mock/dev/e2e)', () => {
		expect(
			shouldDenyApiRequest({
				pathname: '/api/skills/config',
				authAvailable: false,
				hasSession: false,
				isGuest: true
			})
		).toBe(false);
	});

	it('denies by default: a newly added endpoint is protected without any change here', () => {
		expect(shouldDenyApiRequest({ pathname: '/api/some/brand/new/thing', ...anon })).toBe(true);
	});

	it('denies a session that is somehow also flagged as guest', () => {
		expect(
			shouldDenyApiRequest({
				pathname: '/api/stats',
				authAvailable: true,
				hasSession: true,
				isGuest: true
			})
		).toBe(true);
	});
});
