# Sprint 61 — Inline Comment Threads & Margin Annotations

**Sprint Duration:** 2026-03-25
**Status:** 🚀 Active
**Goal:** Wire the existing `CommentSidebar` and `CommentThread` components into the editor so users can highlight text, leave inline comments, and see threaded replies in the margin. Complements AI rewrite/tone tools and review mode.

---

## Stories

### S61-01 — Highlight-to-comment gesture
**File:** `src/lib/elements/EditorPanel.svelte`
- On text selection, add a **Comment** button (💬) to the `SelectionToolbar` alongside Rewrite/Tone
- Clicking it opens the inline comment input anchored to the selection range
- Store the selection range (start/end offsets) alongside the comment

### S61-02 — Comment anchor store
**File:** `src/lib/commentStore.svelte.ts`
- Svelte 5 runes store: `comments[]` with `{ id, docId, anchorStart, anchorEnd, text, author, createdAt, replies[] }`
- `addComment(docId, anchor, text)` — persists via `/api/comments` POST
- `resolveComment(id)` — marks as resolved, removes highlight
- Load comments for active doc on mount

### S61-03 — Margin highlight rendering
**File:** `src/lib/elements/EditorPanel.svelte`
- Render a subtle yellow highlight over anchored text ranges using a `<mark>` overlay or CSS range approach
- Clicking a highlighted range opens the `CommentThread` for that comment
- Resolved comments clear their highlight

### S61-04 — Wire CommentSidebar
**File:** `src/routes/app/+page.svelte` (or layout)
- `CommentSidebar` slides in from the right when comments exist (or via toolbar toggle)
- Lists all unresolved comments for the active document
- Clicking a comment scrolls editor to the anchored range
- "Resolve" button on each thread calls `resolveComment`

### S61-05 — Unit tests Sprint 61
- `commentStore`: addComment, resolveComment, loads per-doc comments
- `CommentThread`: renders author, text, reply count
- SelectionToolbar: Comment button present alongside Rewrite/Tone

### S61-06 — E2E Sprint 61
- Select text → Comment button visible in SelectionToolbar
- Add a comment → highlight appears in editor, comment visible in sidebar
- Click sidebar comment → editor scrolls to anchor
- Resolve comment → highlight clears, comment removed from sidebar

---

## Acceptance Criteria
- [ ] Comment button appears in SelectionToolbar on text selection
- [ ] Comments anchored to text ranges with visible highlights
- [ ] CommentSidebar shows all unresolved comments for active doc
- [ ] Resolve clears highlight and removes from sidebar
- [ ] 0 new test failures introduced
