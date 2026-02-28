```markdown
# Specification – Application

**Version:** 0.1 — Draft
**Audience:** Developers
**Related artifacts:** [bmad/artifacts/prd.md](bmad/artifacts/prd.md), [bmad/artifacts/tech-spec.md](bmad/artifacts/tech-spec.md), [bmad/artifacts/architecture.md](bmad/artifacts/architecture.md)

## Purpose

This specification defines the functional and technical requirements for the Sive application (MVP), focusing on the application-level concerns: core user flows, data model, authentication/authorization, API surface, and operational constraints. It is intended for engineers implementing and testing the system.

## Scope

In scope:

- User authentication and session management.
- Content pages (create, read, update, delete), ownership and permissions.
- Core UI routes and major components required for authoring and suggestion workflows.
- Drizzle-based data model and migration guidance for MVP.
- Development and deployment notes relevant to the application-level behavior.

Out of scope (for this document):

- Detailed AI model architecture or model training pipelines.
- High-scale operational architecture (sharding, distributed DB) — these are future considerations.

## Background

Sive is an AI-assisted writing platform using SvelteKit (Svelte v5) with a lightweight server and SQLite-backed persistence via Drizzle ORM. Authentication is handled by Better-Auth integrated with Drizzle. The project prioritizes rapid iteration, clear server/client separation, and developer-friendly workflows.

Key references:

- PRD: [bmad/artifacts/prd.md](bmad/artifacts/prd.md)
- Tech Spec: [bmad/artifacts/tech-spec.md](bmad/artifacts/tech-spec.md)
- Architecture notes: [bmad/artifacts/architecture.md](bmad/artifacts/architecture.md)

---

## Requirements

### Functional Requirements

- F-01: User authentication — register, login, logout, session management (Better-Auth).  
- F-02: User profile — basic profile fields (id, email, display name).  
- F-03: Pages CRUD — create, read, update, delete content pages owned by users.  
- F-04: Permissions — only owners (or explicit collaborators) can edit private pages.  
- F-05: Editor UI — split editor + suggestions panel, persisted preferences (panel ratio, focus mode).  
- F-06: AI Suggestions — request/receive suggestion diffs, apply or discard proposals.  
- F-07: Coherence & Style Analysis — reports surfaced in the right panel.  
- F-08: Collaboration (MVP minimal) — optimistic locking or last-writer-wins; show edit conflicts.  
- F-09: API surface — authenticated endpoints for pages, suggestions, user info, and health checks.

### Non-Functional Requirements

- N-01: Performance — typical page load < 300ms in dev; AI suggestion latency target < 2s for cached results.  
- N-02: Security — secure cookies, CSRF/XXS considerations, secrets stored in env (BETTER_AUTH_SECRET, OAuth creds).  
- N-03: Reliability — DB migrations applied deterministically; backup/export strategy for SQLite.  
- N-04: Maintainability — clear server/client separation, tests for critical flows (auth, CRUD, suggestions).  
- N-05: Observability — basic logging and health endpoint for host provider.

## Architecture Overview

### Frontend

- SvelteKit (Svelte v5) single-page app with server-rendered routes for initial load.  
- UI routes live under `src/routes`; editor and right-panel components under `lib/elements`.  
- Client code calls server endpoints for CRUD and suggestion requests; UI state persisted via localStorage for preferences.

### Server

- SvelteKit server routes and `+page.server.ts` for server-only logic.  
- Authentication wired via `src/lib/server/auth.ts` using Better-Auth with `drizzleAdapter(db, { provider: 'sqlite' })`.  
- Important invariant: `sveltekitCookies(getRequestEvent)` must be the last plugin in the auth plugin chain (see `hooks.server.ts`).

### Database

- SQLite via Drizzle ORM (`src/lib/server/db/schema.ts`).  
- Core tables: `users`, `sessions` (Better-Auth), `pages` (or `posts`), and any AI-related metadata (requests, caches).  
- Schema changes require `drizzle-kit` migration workflow: `db:generate`, `db:migrate` / `db:push` as per `package.json` scripts.

### API Surface

- Auth endpoints (login, callback, session).  
- Pages endpoints: `GET /api/pages`, `POST /api/pages`, `GET /api/pages/:id`, `PATCH /api/pages/:id`, `DELETE /api/pages/:id`.  
- Suggestions endpoint: `POST /api/suggestions` → returns diff/patch payload.  
- Health: `GET /api/health`.

### Deployment & CI

- Dev: `pnpm dev` / `npm run dev`.  
- Tests: Vitest (unit), Playwright (E2E).  
- CI: run `npm run lint` and `npm test`; include Drizzle migration checks when schema changes detected.

---

Next: Draft API examples, Data Model section (Drizzle schema summary), and Acceptance Criteria.

```

## Data Model (Drizzle schema summary)

The canonical schema lives in `src/lib/server/db/schema.ts`. The summary below captures the core tables and fields used by the application for the MVP.

### `users`

| Column | Type | Notes |
|---|---:|---|
| `id` | integer (PK) | autoincrement primary key |
| `email` | string | unique, indexed |
| `name` | string | display name |
| `created_at` | datetime | default now |

### `sessions` (Better-Auth / adapter)

| Column | Type | Notes |
|---|---:|---|
| `id` | string | session id |
| `user_id` | integer | FK -> `users.id` |
| `expires` | datetime | session expiry |
| `data` | json/text | provider data, tokens, etc. |

### `pages` (content)

| Column | Type | Notes |
|---|---:|---|
| `id` | integer (PK) | autoincrement or UUID depending on schema choice |
| `author_id` | integer | FK -> `users.id` |
| `title` | string | nullable |
| `content` | text | stored document body (MD/HTML) |
| `status` | enum | `draft` / `published` / `archived` |
| `created_at` / `updated_at` | datetime | timestamps |

### `suggestions`

| Column | Type | Notes |
|---|---:|---|
| `id` | integer (PK) | |
| `page_id` | integer | FK -> `pages.id` |
| `source` | string | e.g., `ai` or `user` |
| `patch` | json/text | diff/patch payload (applyable) |
| `applied` | boolean | whether suggestion was applied |
| `created_at` | datetime | |

### `ai_requests` (observability/cache)

| Column | Type | Notes |
|---|---:|---|
| `id` | integer (PK) | |
| `page_id` | integer | optional linkage to page |
| `request` | json/text | request payload captured for debugging |
| `response` | json/text | raw response cached |
| `status` | string | `pending` / `ok` / `error` |
| `latency_ms` | integer | measured roundtrip |
| `created_at` | datetime | |

Note: this summary is a developer-friendly view — always use the canonical definitions in `src/lib/server/db/schema.ts` and follow Drizzle migration commands when changing schema.

## API Examples

Below are example API endpoints and sample requests/responses for common flows.

### Get pages

GET /api/pages

Response 200
```json
[
	{
		"id": 1,
## Acceptance Criteria
		"author_id": 1,
The following acceptance criteria are testable conditions that must be met for the MVP application-level spec to be considered implemented.

- AC-01: Authentication — users can register and log in; `GET /api/auth/session` returns the active user and expiry.
- AC-02: Pages CRUD — authorized users can create, read, update, and delete their pages; results persisted in the database.
- AC-03: Suggestions — `POST /api/suggestions` returns a patch payload that can be applied to a page and is stored in `suggestions`.
- AC-04: Permissions — edit operations return `403` for unauthorized users attempting to modify another user's private page.
- AC-05: DB Migrations — schema changes are captured via Drizzle migrations and the migration commands run without errors in CI.
- AC-06: Basic tests — unit tests cover auth, CRUD, and suggestion flows; at least one E2E test validates the editor + suggestion apply workflow.

## Revision History

| Date | Author | Version | Change |
|---|---|---:|---|
| 2026-02-28 | Documentation Agent | 0.1 | Initial draft: Purpose, Scope, Requirements, Architecture, Data Model, API examples, Acceptance Criteria |

---

This spec is saved to `bmad/docs/spec-application.md`. To iterate, edit the file and run through a review cycle per BMAD process.

```
		"title": "My Story",
		"content": "# Hello",
		"status": "draft",
		"created_at": "2026-02-28T12:00:00Z"
	}
]
```

### Create page

POST /api/pages

Request
```json
{
	"title": "New Page",
	"content": "Some content"
}
```

Response 201
```json
{
	"id": 2,
	"author_id": 1,
	"title": "New Page",
	"content": "Some content",
	"status": "draft",
	"created_at": "2026-02-28T12:15:00Z"
}
```

### Request suggestion

POST /api/suggestions

Request
```json
{
	"page_id": 2,
	"context": "...text around cursor...",
	"prompt": "Improve clarity and tone"
}
```

Response 200
```json
{
	"suggestion_id": 7,
	"patch": {
		"ops": [
			{ "op": "replace", "path": "/content", "value": "Improved content" }
		]
	},
	"created_at": "2026-02-28T12:15:02Z"
}
```

### Session info

GET /api/auth/session

Response 200
```json
{
	"user": { "id": 1, "email": "user@example.com", "name": "Jean" },
	"expires": "2026-02-28T14:00:00Z"
}
```

These examples are intended as a starting point for route implementation and tests.

---

Next: Draft Acceptance Criteria and Revision History.

