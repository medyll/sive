import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Missing credentials' }), { status: 400 });
  }

  try {
    if (!auth || !auth.api || !auth.api.signInEmail) {
      return new Response(JSON.stringify({ message: 'Auth unavailable' }), { status: 503 });
    }

    const result = await auth.api.signInEmail({ email, password });

    // better-auth should set cookies via sveltekitCookies plugin; otherwise return success
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err?.message || 'Sign-in failed' }), { status: 401 });
  }
};
