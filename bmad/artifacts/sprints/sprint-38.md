# Sprint 38 — Document Versioning UI

**Status:** active
**Focus:** Diff viewer, restore from snapshot, version history panel.
**Dates:** 2026-03-17

---

## Stories

### S38-01: Version store (server)
Create `src/lib/server/versions.ts`:
- `Version` type: `{ id, docId, userId, content, title, createdAt, label? }`
- In-memory store: `Map<docId, Version[]>`, max 50 per doc (FIFO eviction)
- `saveVersion(docId, userId, content, title, label?)` — auto-called on save
- `getVersions(docId)` — newest first
- `getVersion(docId, versionId)` — single lookup
- `restoreVersion(docId, versionId)` — returns `{ content, title }`

### S38-02: Versions API
Create `src/routes/api/versions/+server.ts`:
- `GET /api/versions?docId=` — list versions (id, createdAt, label, title preview)
- `POST /api/versions/:id/restore` — restore a version (returns content+title)
- Auth-required

### S38-03: Diff utility
Create `src/lib/diff.ts`:
- `computeDiff(a: string, b: string): DiffChunk[]`
- `DiffChunk`: `{ type: 'equal'|'insert'|'delete', text: string }`
- Line-level Myers diff algorithm (simplified)
- `renderDiffHtml(chunks): string` — returns HTML with `<ins>` / `<del>` / plain spans

### S38-04: Version history panel
Create `src/lib/elements/VersionHistoryPanel.svelte`:
- Sidebar panel listing versions: timestamp + label + word count
- Click a version → shows diff vs current content in a split view
- "Restore" button → confirm dialog → calls API → updates editor content
- "Label this version" inline input
- Empty state: "No versions saved yet"

### S38-05: Auto-save versions on document save
- Hook into `handleSave` in `+page.svelte` to POST a new version after every save
- Only save if content changed (compare hash/length)

### S38-06: Unit tests
- `saveVersion` respects max 50 limit (FIFO)
- `computeDiff` identifies insertions and deletions correctly
- `restoreVersion` returns correct content

### S38-07: E2E tests
- Save doc → version appears in history panel
- Select version → diff displayed
- Restore version → editor content updates
