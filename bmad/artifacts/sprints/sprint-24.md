# Sprint 24 — Document CRUD: Duplicate, Bulk Delete & Context Menu

**Status:** done
**Focus:** Complete the document management CRUD surface — duplicate document, bulk select+delete, and a right-click / keyboard context menu per document item.
**Dates:** 2026-03-16

---

## Stories

### S24-01: `duplicateDocument` server action
Add a `duplicateDocument` form action to `+page.server.ts`.
- Copies title ("Copy of …") and content from the source document.
- Creates a new UUID, inserts into `documents`, creates owner share.
- Mock/dev fallback returns `{ success: true, id }`.

### S24-02: Duplicate wiring in `+page.svelte`
- Add hidden `<form>` for the `duplicateDocument` action.
- Add `handleDuplicate(id)` that submits form and optimistically inserts the new doc into local `documents` state.
- Pass `onDuplicate` prop to `DocumentList`.

### S24-03: Context menu per document item
Add a `⋯` button (visible on hover/focus) to each `doc-item` in `DocumentList`.
Clicking it opens a small dropdown with: **Rename**, **Duplicate**, **Delete**.
Keyboard: `ArrowDown/Up` to navigate, `Enter` to activate, `Escape` to close.
Closes on outside click (click-away handler via `$effect`).

### S24-04: Bulk select + delete
- Add a checkbox to each doc item (visible when `bulkMode` is active).
- "Select all / Deselect all" toggle in the header when ≥1 item is checked.
- "Delete selected (N)" danger button in the header.
- Calls `onBulkDelete(ids: string[])` prop; page serially calls `deleteDocument` for each id.
- Bulk mode activates when the user holds `Shift` and clicks any item, or presses `Ctrl+Shift+X`.

### S24-05: Unit tests — sprint 24
`src/lib/elements/DocumentList.spec.ts` — tests for:
- Context menu opens/closes and each action fires correct callback.
- Duplicate action adds item optimistically.
- Bulk select: checkbox toggle, select-all, bulk-delete callback.

### S24-06: E2E test — duplicate & bulk delete
`e2e/sprint24.spec.ts` — Playwright tests:
- Duplicate document via context menu → new doc "Copy of …" appears in sidebar.
- Bulk select two docs → delete → both removed from sidebar.
