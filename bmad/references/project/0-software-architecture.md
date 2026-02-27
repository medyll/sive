<!-- 0-software-architecture.md -->
## Software Architecture

- **Primary stack:** Svelte 5 + SvelteKit with Vite for bundling and dev server (scripts: `dev`, `build`, `preview`).
- **Language:** TypeScript (see `tsconfig.json`).
- **Runtime / modules:** Node.js in ESM mode (`type: "module"` in `package.json`).
- **Authentication:** `better-auth` on the server — configured in `src/lib/server/auth.ts` and wired in `src/hooks.server.ts`.
- **Database:** SQLite using `better-sqlite3` and Drizzle ORM (`drizzle-orm` + `drizzle-kit`). Schema and migrations are managed with `db:generate`, `db:push`, `db:migrate`, `db:studio`; primary schema file: `src/lib/server/db/schema.ts`.
- **Testing:** Unit tests with `vitest` (`test:unit`) and E2E tests with Playwright (`test:e2e`).
- **Code style & linting:** Prettier + ESLint (Svelte/Tailwind plugins) — scripts `lint` and `format`.
- **Styling / UI tooling:** Tailwind CSS and related plugins; `mdsvex` is available for markdown-style components.
- **Developer tooling:** `@sveltejs/adapter-auto`, `@sveltejs/vite-plugin-svelte`, and other devDependencies listed in `package.json`.
- **Recommended package manager:** `pnpm` (workspace + `pnpm-lock.yaml` present).

**Important notes / procedures:**
- Any schema changes must be accompanied by the appropriate `drizzle-kit` commands to regenerate migrations and types.
- `better-auth` integration relies on server-side initialization invariants — keep plugin ordering and related setup in `src/lib/server/auth.ts` unchanged unless verified.