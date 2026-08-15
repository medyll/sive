/**
 * Authorization policy for /api routes.
 *
 * Kept separate from hooks.server.ts so the decision is a pure function and can
 * be tested without standing up better-auth or SvelteKit.
 */

/**
 * API routes that must stay reachable without an authenticated session.
 *
 * Everything under /api is denied by default; only these prefixes are open.
 * The list is deliberately explicit — adding a route here is a security
 * decision, and forgetting to add one fails closed with a 401 rather than
 * silently exposing the endpoint.
 */
export const PUBLIC_API_PREFIXES = [
	'/api/auth', // better-auth's own handler (sign in, sign up, callbacks)
	'/api/guest/status', // reports guest state; meaningless if it requires a session
	'/api/guest/convert' // turns a guest into a real account
] as const;

export function isApiRoute(pathname: string): boolean {
	return pathname === '/api' || pathname.startsWith('/api/');
}

export function isPublicApiRoute(pathname: string): boolean {
	return PUBLIC_API_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export interface ApiRequestContext {
	pathname: string;
	/** Whether an auth backend is available at all (false in mock/dev/e2e). */
	authAvailable: boolean;
	/** True when the request carries a real authenticated session. */
	hasSession: boolean;
	/** True when the request is running under the stub guest identity. */
	isGuest: boolean;
}

/**
 * Returns true when the request must be rejected with 401.
 *
 * Note on `isGuest`: hooks.server.ts assigns a stub guest user whenever there
 * is no session, so `locals.user` is always truthy and cannot be used as an
 * authorization signal. Authorization keys off the session instead.
 */
export function shouldDenyApiRequest(ctx: ApiRequestContext): boolean {
	if (!isApiRoute(ctx.pathname)) return false;

	// No auth backend (mock/dev/e2e): there are no sessions to check, and the
	// app already serves stub data in this mode.
	if (!ctx.authAvailable) return false;

	if (isPublicApiRoute(ctx.pathname)) return false;

	return !ctx.hasSession || ctx.isGuest;
}
