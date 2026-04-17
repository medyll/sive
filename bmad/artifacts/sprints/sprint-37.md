# Sprint 37 — Collaborative Cursors

**Status:** active
**Focus:** Show real-time cursor positions and selections of other users in the shared editor.
**Dates:** 2026-03-17

---

## Stories

### S37-01: Cursor position broadcasting
Extend presence SSE to broadcast cursor position:
- Add `cursor: { offset: number, userId: string, userName: string, color: string }` to presence payload
- `src/lib/server/presence.ts` — extend `PresenceUser` type with `cursor` field
- POST `/api/presence/cursor` — accepts `{ docId, offset }`, updates presence store, fans out to subscribers
- Debounce: only broadcast when offset changes and at most every 200ms

### S37-02: Cursor color assignment
- Assign a stable color per userId from a palette of 8 colors (cycle by hash)
- `src/lib/cursorColors.ts` — `getCursorColor(userId): string` using palette index from hash
- Palette: indigo, rose, emerald, amber, sky, violet, pink, teal

### S37-03: Remote cursor overlay in editor
Create `src/lib/elements/RemoteCursors.svelte`:
- Renders colored cursor carets at the correct character offset within the editor
- Uses a `<div class="remote-cursor">` absolutely positioned over the editor
- Each cursor shows: colored vertical bar + name label (appears on hover or 2s then fades)
- Reads from `presenceStore` — only shows cursors for same `docId`
- Cursor positions recalculate on editor resize (ResizeObserver)

### S37-04: Selection highlighting
- Extend cursor payload with `selection: { start: number, end: number } | null`
- Render semi-transparent colored highlight behind selected text range
- Only shown when `end > start`

### S37-05: Unit tests
- `getCursorColor` returns consistent color for same userId
- Cursor debounce: only 1 broadcast per 200ms window
- Color palette cycles correctly for > 8 users

### S37-06: E2E tests
- Open same doc in two browser contexts → cursor from context A visible in context B
- Cursor label shows username
- Cursor disappears when user disconnects (presence cleanup)
