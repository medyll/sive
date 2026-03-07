Developer Quickstart — Sive

Prereqs
- Node.js (recommended LTS), `pnpm` preferred.
- Env vars: `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ORIGIN`, `DATABASE_URL` (dev may run with mocks).

Install
```bash
pnpm install
# or
npm install
```

Run
```bash
npm run dev
# build
npm run build
# preview
npm run preview
```

Tests
```bash
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (build + preview required if configured)
```

DB / Drizzle
- Edit schema: `src/lib/server/db/schema.ts`.
- After changes run:
```bash
npm run db:generate
npm run db:push   # or `npm run db:migrate` depending on workflow
```
- Regenerate auth types when needed:
```bash
npm run auth:schema
```

Auth notes & pitfalls
- `better-auth` + Drizzle used for auth. Keep `sveltekitCookies(getRequestEvent)` as the last plugin in `src/lib/server/auth.ts` `plugins` array.
- `better-sqlite3` is a native binding; missing binaries may cause fallback mocks in dev.

Conventions
- Formatting: Prettier (tabs, single quotes). Use `npm run format`.
- Imports: external → `$app`/`$lib` → local relative.
- Server code: put server-only logic in `+page.server.ts` and leave UI in `.svelte` files.

Where to look
- `src/lib/server/auth.ts`
- `src/hooks.server.ts`
- `src/lib/server/db/schema.ts`
- `src/lib/server/db/index.ts`
- `package.json`

If you need a tailored onboarding doc (IDE setup, debugging native sqlite, or Playwright run commands), tell me which area to expand.