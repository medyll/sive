# Sive Agent Guide

This file helps agentic coding assistants work effectively in this repository.
Keep guidance concise, accurate, and aligned with the existing codebase.

## Project summary

- SvelteKit app (Svelte v5) with Tailwind v4
- Drizzle ORM + SQLite (better-sqlite3)
- Better-Auth for authentication
- Vitest for unit tests, Playwright for E2E
- Typescript strict mode

Key structure:

- UI/routes: `src/routes`
- Server helpers: `src/lib/server`
- Types: `src/lib/types/types.ts`
- E2E tests: `e2e/`

## Install and dev

- Preferred: `pnpm install` (repo contains `pnpm-lock.yaml` and `pnpm-workspace.yaml`)
- Alternative: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Lint, format, typecheck

- Typecheck: `npm run check`
- Typecheck watch: `npm run check:watch`
- Lint: `npm run lint` (Prettier check + ESLint)
- Format: `npm run format`

## Test commands (unit and E2E)

- Unit tests (Vitest): `npm run test:unit`
- E2E (Playwright): `npm run test:e2e`
- Full suite: `npm run test`

Single test examples:

- Vitest single file: `npm run test:unit -- --run src/routes/auth/tests/server.spec.ts`
- Vitest by name: `npm run test:unit -- --run --testNamePattern "returns 400"`
- Playwright single file: `npm run test:e2e -- e2e/auth-flow.spec.ts`
- Playwright by title: `npm run test:e2e -- --grep "login"`

Note: Playwright uses `npm run build && npm run preview` as its web server.

## Database and auth scripts

- Generate Drizzle migrations: `npm run db:generate`
- Push schema: `npm run db:push`
- Run migrations: `npm run db:migrate`
- Studio: `npm run db:studio`
- Better-Auth schema: `npm run auth:schema`

## Copilot instructions (repo-specific, must follow)

- Central spec: `bmad/references/PROJECT.md` should be consulted frequently.
- Preserve DB schema/migrations: editing `src/lib/server/db/schema.ts` requires Drizzle commands and a migration plan.
- Preserve auth invariants: in `src/lib/server/auth.ts`, `sveltekitCookies(getRequestEvent)` must be the last plugin.
- Maintain server/client separation: server-only logic in `+page.server.ts`, UI in `.svelte`.
- Auth/session propagation: `src/hooks.server.ts` attaches `event.locals.session` and `event.locals.user`.
- Env vars include `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ORIGIN`.

## Cursor rules

No Cursor rules found in `.cursor/rules/` or `.cursorrules`.

## Code style guidelines

### Formatting

- Prettier config: tabs, single quotes, print width 100, no trailing commas.
- Svelte files use the Svelte parser via Prettier.
- Tailwind class sorting uses `prettier-plugin-tailwindcss`.

### Imports

- External imports first, then SvelteKit `$app`/`$lib`, then local relative imports.
- Use `import type` for types (see `src/lib/server/auth.ts`, `src/app.d.ts`).

Example:

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

import { auth, isMock } from '$lib/server/auth';
```

### TypeScript

- `strict: true` is enabled. Avoid `any` unless necessary.
- Prefer explicit types for public functions and exports.
- Use `unknown` for caught errors and narrow before use.
- Keep types consistent with YAML schemas in `bmad/references/project/*`.

### Svelte 5 patterns

- Use runes (`$state`, `$effect`, `$props`) for reactivity.
- Keep server-only code out of `.svelte` components.
- Avoid side effects in module scope; prefer `$effect`.

### Naming

- camelCase for variables and functions.
- PascalCase for components, types, interfaces, and classes.
- Files follow SvelteKit conventions (`+page.svelte`, `+page.server.ts`, etc.).

### Error handling

- Server actions: return `fail(status, { error })` for validation errors.
- When redirecting, rethrow `Response` errors to preserve the redirect.
- Prefer clear, user-safe messages; avoid leaking stack traces.

### Auth and DB safety

- Keep `sveltekitCookies` last in the auth plugin list.
- If DB schema changes, run Drizzle commands and update migrations.
- In dev environments without DB bindings, `src/lib/server/auth.ts` falls back to a stub; keep this behavior intact.

### Tests

- Unit tests live in `src/**/*.spec.ts` (and Svelte component specs).
- E2E tests live in `e2e/*.spec.ts`.
- Use descriptive test names and cover error paths.
- When mocking, follow the Vitest pattern used in `src/routes/auth/tests/server.spec.ts`.

## Useful references

- Auth config: `src/lib/server/auth.ts`
- Hooks and locals: `src/hooks.server.ts`
- DB schema: `src/lib/server/db/schema.ts`
- Prettier config: `.prettierrc`
- ESLint config: `eslint.config.js`
- Project spec index: `bmad/references/PROJECT.md`

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any shell command containing `curl` or `wget` will be intercepted and blocked by the context-mode plugin. Do NOT retry.
Instead use:
- `context-mode_ctx_fetch_and_index(url, source)` to fetch and index web pages
- `context-mode_ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any shell command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` will be intercepted and blocked. Do NOT retry with shell.
Instead use:
- `context-mode_ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### Direct web fetching — BLOCKED
Do NOT use any direct URL fetching tool. Use the sandbox equivalent.
Instead use:
- `context-mode_ctx_fetch_and_index(url, source)` then `context-mode_ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Shell (>20 lines output)
Shell is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `context-mode_ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `context-mode_ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### File reading (for analysis)
If you are reading a file to **edit** it → reading is correct (edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `context-mode_ctx_execute_file(path, language, code)` instead. Only your printed summary enters context.

### grep / search (large results)
Search results can flood context. Use `context-mode_ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `context-mode_ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `context-mode_ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `context-mode_ctx_execute(language, code)` | `context-mode_ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `context-mode_ctx_fetch_and_index(url, source)` then `context-mode_ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `context-mode_ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `upgrade` MCP tool, run the returned shell command, display as checklist |
