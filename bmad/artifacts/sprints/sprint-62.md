# Sprint 62 — Document Comments & Annotations

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Allow users to leave inline comments on selected text. Comments appear as margin annotations, support replies, and are persisted to the database.

---

## Stories

### S62-01 — Comment data model & store
**File:** `src/lib/commentStore.svelte.ts`
- `Comment`: `{ id, docId, userId, anchorText, anchorOffset, body, createdAt, resolved }`
- `commentStore`: load(docId), add(comment), resolve(id), remove(id)
- Persist to localStorage for now (`sive:comments:{docId}`); DB wire-up deferred
- `$derived` list of unresolved comments sorted by anchorOffset

### S62-02 — CommentThread component
**File:** `src/lib/elements/CommentThread.svelte`
- Shows a single comment + reply input
- Props: `comment`, `onResolve`, `onRemove`
- Resolve button marks comment as resolved (strikethrough + hide)
- Timestamp formatted as relative time ("2 min ago")

### S62-03 — CommentSidebar component
**File:** `src/lib/elements/CommentSidebar.svelte`
- Lists all unresolved CommentThreads for the current document
- "Add comment" button visible only when text is selected (receives `selectionText` prop)
- New comment form: textarea + Submit / Cancel
- Slides in from the right edge of the editor

### S62-04 — Wire comment highlight in EditorPanel
**File:** `src/lib/elements/EditorPanel.svelte`
- When comments exist, underline anchored text with a subtle yellow highlight
- Click on highlighted text → focus the corresponding CommentThread in sidebar
- Use `mark` wrapping via a lightweight overlay (no contenteditable — keep textarea)

### S62-05 — Unit tests Sprint 62
- commentStore: add, resolve, remove, persist to localStorage, load from localStorage
- CommentThread: renders body, resolve click fires callback, timestamp display
- CommentSidebar: shows/hides add form on selection

### S62-06 — E2E Sprint 62
- Select text → click "Add comment" → type comment → Submit
- Comment appears in sidebar with anchor text quoted
- Click Resolve → comment disappears from sidebar

---

## Acceptance Criteria
- [ ] Comments persist across page reload (localStorage)
- [ ] Resolved comments hidden from sidebar
- [ ] Anchor text quoted in comment thread
- [ ] 0 new test failures
