
# Sive — AI-Assisted Writing Software

Sive is an AI-powered writing assistant designed for authors, screenwriters, and creative professionals. It helps you write, edit, and refine narrative text with real-time AI suggestions, coherence checks, and stylistic analysis. Built with SvelteKit (Svelte 5), it offers a modern, responsive interface and advanced developer tooling.

---

## Features for End Users

- **Split-Screen Editor:** Resizable panels for writing and AI suggestions. Focus mode hides distractions.
- **AI Suggestions:** Contextual proposals, diff view, and selective validation.
- **Coherence Engine:** Real-time alerts for narrative and physical inconsistencies (character states, timelines, logic).
- **Style Analysis:** Detects language tics, repetitions, and provides stylistic metrics. Adjustable sliders for tone, rhythm, density.
- **History & Timeline:** Snapshot navigation and event chronology.
- **Voice & Image:** Floating bar for voice commands and image uploads.
- **Hybrid AI:** Local (Ollama) and cloud (Gemini, OpenAI) models, configurable per user/task.
- **Fact-Checking:** On-demand web search (DuckDuckGo, Wikipedia) for factual verification.

---

## Developer Workflow: Mockup Templating

Sive uses a mockup-to-component templating system for rapid UI prototyping and reference. The goal is to provide some reference code for the ai follow svelte-5 rules.
The mockup for the updated application layout is provided in the [bmad\references\sive-layout.html](bmad\references\sive-layout.html)
- **Source:** HTML application mockup file (sive-layout) with custom tags and attributes. The application layout
- **Conversion:** Run `node ./src/bmad/tools/convert-mockup.js <input-file> [output-dir]` to generate Svelte 5 component scaffolds.
- **Template:** The template for the components is defined in [`convert-mockup-template.md`](src/lib/tools/mockup/convert-mockup-template.md) and includes placeholders:
	- `{{COMPONENT_NAME}}`: PascalCase component name
	- `{{TAG}}`: original mockup tag
	- `{{ID}}`: id value or null
	- `{{ATTRS_JSON}}`: JSON object of attributes
- **Output:** Components are generated in `src/lib/elements/mockups/`., following Bits UI standards (headless, accessible, snippet-based).

See [`convert-mockup.js`](src/bmad/tools/convert-mockup.js) for implementation details.

---

## Bits UI Component Standards

Sive follows the Bits UI convention for Svelte 5 primitives:

- **Headless by default:** Logic and accessibility, no enforced styles.
- **Snippets over slots:** Use Svelte 5 snippets for content injection.
- **Prop drilling:** Pass all HTML attributes via `{...rest}`.
- **Composition:** Build UI via component composition, not deep prop nesting.
- **Type safety:** All components are TypeScript, with strict interfaces.
- **Accessibility:** Implements ARIA roles and keyboard interactions.

See [`BITS-UI-Standard.md`](docs/BITS-UI-Standard.md) for full guidelines.

---

## Project Setup & Scripts

### Developer Quickstart

1. Install dependencies: `pnpm install` (preferred) or `npm install`
2. Copy and fill env: `cp .env.example .env` (see **Authentication & Database** below)
3. Run DB migrations: `npm run db:generate && npm run db:migrate`
4. Start dev server: `pnpm dev` or `npm run dev`
5. Run unit tests: `npm run test:unit`
6. Run e2e tests: `npm run test:e2e`

### All scripts

| Command | Description |
|---|---|
| `pnpm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Push schema to DB (dev shortcut) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run auth:schema` | Regenerate `auth.schema.ts` from Better-Auth |

---

## Authentication & Database

Sive uses [Better-Auth](https://www.better-auth.com/) for authentication and SQLite via [Drizzle ORM](https://orm.drizzle.team/) for persistence.

### 1. Environment variables

Copy the example file and fill in the values:

```sh
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes (for full auth) | Path to the SQLite file, e.g. `local.db` |
| `BETTER_AUTH_SECRET` | Yes | Random 32-char secret — generate with `openssl rand -base64 32` |
| `ORIGIN` | Yes | App origin URL, e.g. `http://localhost:5173` |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth app client secret |

### 2. Database setup & migrations

After setting `DATABASE_URL`, run the Drizzle migrations:

```sh
npm run db:generate   # generate migration files from schema
npm run db:migrate    # apply migrations to the SQLite file
```

To browse the database interactively:

```sh
npm run db:studio
```

### 3. Running without a database (mock mode)

If `DATABASE_URL` is not set (or `better-sqlite3` native bindings fail to load), the app starts in **degraded mock mode**: all pages render, but sign-in/sign-out calls return a `503 Auth unavailable` error. This is useful for pure UI work without a local DB.

To re-enable full auth, ensure `DATABASE_URL` is set and run `npm run db:migrate`.

### 4. Auth configuration

- Auth is initialised in [`src/lib/server/auth.ts`](src/lib/server/auth.ts) with `drizzleAdapter` and the `sveltekitCookies` plugin (must remain last in the `plugins` array).
- Session and user data are attached to `event.locals` by [`src/hooks.server.ts`](src/hooks.server.ts).
- Schema for auth tables is generated via `npm run auth:schema` (outputs `src/lib/server/db/auth.schema.ts`).

## Project Structure

- `src/routes/` — SvelteKit routes and pages
- `src/lib/` — shared UI components, server helpers, and utilities
- `src/lib/server/` — server-only helpers (DB, auth, adapters)
- `bmad/` — project artifacts, PRDs, mockups, sprints


## BMAD Workflow & Artifacts

- Project planning, PRDs, sprint plans, and mockup templates live under the `bmad/` folder (see `bmad/config.yaml`).
- Generate mockups with the repository's helper command: `pnpm run gen:mockups` (produces components in `src/lib/elements/mockups`).
- Sprint plans and stories: `bmad/artifacts/sprints/` and `bmad/artifacts/stories/`.

## Contributing

- Use pnpm for dependency management: `pnpm install`.
- Run unit tests: `npm run test:unit`. Run e2e tests: `npm run test:e2e`.
- When opening PRs, include clear description, link to related BMAD artifact (if any), and ensure tests pass locally.

---

## License

MIT License. See LICENSE file.
