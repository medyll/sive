
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
2. Copy example env (if present) and set required variables (`BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ORIGIN`)
3. Start local dev server: `pnpm dev` or `npm run dev`
4. Run unit tests: `npm run test:unit`
5. Run e2e tests: `npm run test:e2e`


## Project Setup & Scripts

- **Install dependencies:**
	```sh
	pnpm install
	```
- **Start dev server:**
	```sh
	npm run dev
	```
- **Build for production:**
	```sh
	npm run build
	```
- **Preview build:**
	```sh
	npm run preview
	```
- **Database migration:**
	```sh
	npm run db:generate
	npm run db:push
	npm run db:migrate
	npm run db:studio
	```
- **Testing:**
	```sh
	npm run test:unit
	npm run test:e2e
	```

---

## Authentication & Database

- **Auth:** Uses Better-Auth, configured in [`src/lib/server/auth.ts`](src/lib/server/auth.ts).
- **Database:** SQLite via Drizzle ORM. Schema in [`src/lib/server/db/schema.ts`](src/lib/server/db/schema.ts).

## Project Structure

- `src/routes/` — SvelteKit routes and pages
- `src/lib/` — shared UI components, server helpers, and utilities
- `src/lib/server/` — server-only helpers (DB, auth, adapters)
- `bmad/` — project artifacts, PRDs, mockups, sprints


## BMAD Workflow & Artifacts

- Project planning, PRDs, sprint plans, and mockup templates live under the `bmad/` folder (see `bmad/config.yaml`).
- Generate mockups with the repository's helper command: `pnpm run gen:mockups` (produces components in `src/lib/elements/mockups`).
- Sprint plans and stories: `bmad/artifacts/sprints/` and `bmad/artifacts/stories/`.

## Environment

- Required environment variables for local development: `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ORIGIN`.
- Local DB: uses SQLite (no external DB required); see `src/lib/server/db/` for configuration and schema.

## Contributing

- Use pnpm for dependency management: `pnpm install`.
- Run unit tests: `npm run test:unit`. Run e2e tests: `npm run test:e2e`.
- When opening PRs, include clear description, link to related BMAD artifact (if any), and ensure tests pass locally.

---

## License

MIT License. See LICENSE file.
