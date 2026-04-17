# Sprint 8 — Document Persistence

**Duration:** 2026-03-01 → 2026-03-15
**Capacity:** ~18 story points

## Sprint Goal

Users can create, save, and reload writing documents from SQLite. The EditorPanel binds to real content with debounced auto-save. A DocumentList sidebar enables switching between documents.

## Stories

| ID | Title | Points | Priority |
|---|---|---:|---|
| S8-01 | Schema Drizzle `documents` table | 3 | Must |
| S8-02 | Server load/save handlers (`+page.server.ts`) | 3 | Must |
| S8-03 | Wire EditorPanel → DB (auto-save 2s debounce) | 5 | Must |
| S8-04 | DocumentList sidebar component | 3 | Must |
| S8-05 | Unit tests — server handlers | 2 | Should |
| S8-06 | E2E — create doc, type, reload, assert content | 2 | Should |

**Total:** 18 pts

## Dependencies

- S8-01 must be done before S8-02
- S8-02 must be done before S8-03, S8-04, S8-05
- S8-03 must be done before S8-06

## Definition of Done

- [ ] `documents` table in schema + migration applied
- [ ] `/app` page load returns user documents
- [ ] EditorPanel auto-saves on content change (debounced 2s)
- [ ] DocumentList shows list, supports new doc creation
- [ ] Unit tests pass for server handlers (mock DB)
- [ ] E2E: create doc → type → reload → content persists

## Risks

- `isMock=true` fallback: server handlers must degrade gracefully (return stubs) when better-sqlite3 is unavailable
- EditorPanel currently uses `contenteditable` with events prop — needs refactor to plain-text content prop
