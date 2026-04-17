# Sive — Project Context Guide

## Project Overview

**Sive** is an AI-powered writing assistant designed for authors, screenwriters, and creative professionals. Built with **SvelteKit (Svelte 5)** and **Tailwind CSS v4**, it provides real-time AI suggestions, coherence checks, and stylistic analysis for narrative writing.

### Core Technologies

| Layer | Technology |
|-------|------------|
| **Frontend** | Svelte 5 (runes), SvelteKit, Tailwind CSS v4 |
| **Backend** | Node.js, Better-Auth |
| **Database** | SQLite via Drizzle ORM |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Package Manager** | pnpm (preferred) |

### Key Features

- Split-screen editor with resizable panels and focus mode
- AI suggestions with diff view and selective validation
- Coherence engine for narrative/physical consistency checks
- Style analysis with adjustable tone, rhythm, and density
- Voice commands and image uploads
- Hybrid AI support (local Ollama + cloud Gemini/OpenAI)
- Fact-checking via web search integration

---

## Project Structure

```
sive/
├── src/
│   ├── routes/          # SvelteKit routes and pages
│   ├── lib/
│   │   ├── elements/    # UI components (Bits UI standard)
│   │   ├── editor/      # Editor-specific components
│   │   ├── server/      # Server-only helpers (auth, DB)
│   │   ├── types/       # TypeScript type definitions
│   │   └── styles/      # Global styles and Tailwind config
│   ├── app.d.ts         # Global type declarations
│   ├── app.html         # HTML template
│   └── hooks.server.ts  # Request hooks (auth, security headers)
├── bmad/                # Project artifacts, PRDs, sprints, mockups
├── e2e/                 # Playwright E2E tests
├── drizzle/             # Database migrations
├── static/              # Static assets
└── public/              # Public files
```

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks.server.ts` | Attaches session/user to `event.locals`, applies security headers |
| `src/lib/server/auth.ts` | Better-Auth configuration with Drizzle adapter |
| `src/lib/server/db/schema.ts` | Drizzle ORM schema for SQLite tables |
| `src/app.d.ts` | TypeScript declarations for `App.Locals` interface |
| `bmad/config.yaml` | BMAD project configuration and workflow settings |

---

## Building and Running

### Prerequisites

1. Install dependencies:
   ```sh
   pnpm install
   ```

2. Set up environment variables:
   ```sh
   cp .env.example .env
   ```

   Required variables in `.env`:
   - `DATABASE_URL=local.db` — SQLite database path
   - `BETTER_AUTH_SECRET=<32-char-random>` — Generate with `openssl rand -base64 32`
   - `ORIGIN=http://localhost:5173` — App origin URL
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — Optional OAuth credentials

3. Initialize database:
   ```sh
   npm run db:generate
   npm run db:migrate
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript type checking |
| `npm run check:watch` | Type checking in watch mode |
| `npm run lint` | ESLint + Prettier check |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format with Prettier |

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Push schema to DB (dev shortcut) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |
| `npm run auth:schema` | Regenerate auth schema from Better-Auth |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test` | Run full test suite |

**Single test examples:**
```sh
# Vitest by file
npm run test:unit -- --run src/routes/auth/tests/server.spec.ts

# Vitest by name pattern
npm run test:unit -- --run --testNamePattern "returns 400"

# Playwright by file
npm run test:e2e -- e2e/auth-flow.spec.ts

# Playwright by title
npm run test:e2e -- --grep "login"
```

---

## Development Conventions

### Code Style

- **Formatting:** Tabs, single quotes, print width 100, no trailing commas
- **Imports order:** External → SvelteKit `$app`/`$lib` → Local relative
- **TypeScript:** Strict mode enabled; avoid `any`, use explicit types for exports
- **Svelte 5:** Use runes (`$state`, `$effect`, `$props`) for reactivity

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/Functions | camelCase | `handleAuth`, `userProfile` |
| Components/Types | PascalCase | `SummaryPanel`, `UserSession` |
| Files | SvelteKit conventions | `+page.svelte`, `+page.server.ts` |

### Server/Client Separation

- **Server-only code:** Place in `+page.server.ts` or `src/lib/server/`
- **Client components:** `.svelte` files must not import server-only modules
- **Session handling:** Access via `event.locals.session` and `event.locals.user` in server code

### Auth Invariants

1. `sveltekitCookies(getRequestEvent)` **must be the last plugin** in the auth plugin array
2. Auth schema lives in `src/lib/server/db/auth.schema.ts` (generated via `npm run auth:schema`)
3. Mock mode: If `DATABASE_URL` is unset, app runs in degraded mode with stub auth

### Error Handling

- **Server actions:** Return `fail(status, { error })` for validation errors
- **Redirects:** Rethrow `Response` errors to preserve redirect behavior
- **User messages:** Clear and safe; never leak stack traces

### Bits UI Component Standards

All UI components follow Bits UI conventions:

- **Headless by default:** Logic and accessibility without enforced styles
- **Snippets over slots:** Use Svelte 5 snippets for content injection
- **Prop drilling:** Pass HTML attributes via `{...rest}`
- **Type safety:** Strict TypeScript interfaces
- **Accessibility:** ARIA roles and keyboard interactions

See `docs/BITS-UI-Standard.md` for full guidelines.

---

## Mockup Templating System

Sive uses a mockup-to-component system for rapid UI prototyping:

1. **Source:** HTML mockup file (`bmad/references/sive-layout.html`)
2. **Convert:** Run `node ./src/bmad/tools/convert-mockup.js <input-file> [output-dir]`
3. **Output:** Svelte 5 components in `src/lib/elements/mockups/`

Template placeholders:
- `{{COMPONENT_NAME}}` — PascalCase component name
- `{{TAG}}` — Original mockup tag
- `{{ID}}` — ID value or null
- `{{ATTRS_JSON}}` — JSON object of attributes

---

## Environment Notes

### Mock Mode (No Database)

If `DATABASE_URL` is not set or native bindings fail:
- App renders all pages
- Sign-in/sign-out calls return `503 Auth unavailable`
- Useful for pure UI development without local DB

### Security Headers

Applied to all responses via `hooks.server.ts`:
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security
- Referrer-Policy
- X-XSS-Protection

---

## Contributing

1. Use **pnpm** for dependency management
2. Run tests before committing: `npm run test`
3. Include clear PR descriptions linking to related BMAD artifacts
4. Follow coding conventions (lint/typecheck must pass)

### BMAD Workflow

- **PRDs and specs:** `bmad/references/`
- **Sprint plans:** `bmad/sprints/`
- **User stories:** `bmad/artifacts/stories/`
- **Mockups:** `bmad/references/sive-layout.html`

---

## License

MIT License. See LICENSE file.
