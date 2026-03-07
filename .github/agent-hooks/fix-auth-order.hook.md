Auth plugin order checker (example hook)

Purpose:
- Inspect `src/lib/server/auth.ts` and `src/hooks.server.ts` and confirm `sveltekitCookies(getRequestEvent)` is the last plugin in the `plugins` array. If not, propose a non-destructive patch and list manual verification steps.

Manual verification steps to include in PR notes:
1. Run dev server and confirm login flow works (`npm run dev`).
2. Check that `event.locals.session` is set in `src/hooks.server.ts` after auth initialization.
3. Run `npm run test:unit` for auth-related specs.

Use when PRs modify `src/lib/server/auth.ts` or `src/hooks.server.ts`.