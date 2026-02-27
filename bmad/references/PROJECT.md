 # 📘 Design Document — AI-Assisted Writing Software
 **Version 1.0 — Reference Document**  
 Stack: Svelte + LiveKit · Philosophy: awareness, multimodal efficiency, multi-user isolation, refactoring.

---

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

---

## 1. Interface Architecture (Layout)
  (1-interface-architecture.md)[1-interface-architecture.md]

---

## 2. Coherence Engine & Pure Logic
  (2-coherence-engine-pure-logic.md)[2-coherence-engine-pure-logic.md]

---

## 3. Stylistic Mastery & Voice
  (3-stylistic-mastery-voice.md)[3-stylistic-mastery-voice.md]

---

## 4. Intelligence & Data
  (4-intelligence-data.md)[4-intelligence-data.md]

---

## 5. AI Architecture — MCP & Skills
  (5-ai-architecture-mcp-skills.md)[5-ai-architecture-mcp-skills.md]

---

## 6. Versioning & Validation
  (6-versioning-validation.md)[6-versioning-validation.md]

---

## 7. Review Mode
  (7-review-mode.md)[7-review-mode.md]

---

## 8. Multi-User Administration & Authentication
  (8-multi-user-administration-authentication.md)[8-multi-user-administration-authentication.md]

---

## 9. Layout — Semantic Interface Description
  (9-layout-semantic-interface-description.md)[9-layout-semantic-interface-description.md]

---

## Appendix — Prioritization Recommendation
  (10-appendix-prioritization-recommendation.md)[10-appendix-prioritization-recommendation.md]

---

