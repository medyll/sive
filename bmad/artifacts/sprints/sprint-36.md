# Sprint 36 — Virtualized List & Performance

**Status:** planned
**Focus:** Virtualize the document list for 100+ docs, lazy-load stats, debounce saves, bundle audit.
**Dates:** 2026-03-17

---

## Stories

### S36-01: Virtual document list
Create `src/lib/elements/VirtualDocumentList.svelte`:
- Replaces inner scroll content of DocumentList
- Renders only visible rows + overscan of 3 above/below
- Row height: fixed 64px (consistent with current design)
- Recalculates visible window on scroll and resize (ResizeObserver)
- Maintains scroll position when active doc changes
- Accessible: `role="listbox"`, correct `aria-posinset` / `aria-setsize`

### S36-02: Debounced document save
Enhance `updateDocument` action call sites:
- Debounce auto-save: 1500ms after last keystroke (was immediate or uncontrolled)
- Show "Saving…" → "Saved ✓" indicator with 2s fade
- Queue concurrent saves — only send latest content if multiple edits pending
- On unmount: flush pending save immediately (beforeunload guard)

### S36-03: Lazy stats in document list
Defer stats computation:
- Word count per doc in list computed client-side lazily (requestIdleCallback)
- Batch: process max 5 docs per idle frame
- Cache computed counts in a `Map<docId, number>` (clears on doc update)
- WordCountBadge in list uses cached value (no server round-trip)

### S36-04: Image & asset optimisation
- Audit all SVG icons — replace with inline `<svg>` or sprite to eliminate extra requests
- Ensure no unused imports in major bundle entry points
- Add `loading="lazy"` to any `<img>` tags
- Verify SvelteKit code-splitting is active for route chunks

### S36-05: Unit tests
- VirtualList renders correct subset of rows for a given viewport height
- Scroll event updates visible window
- Debounce save: verify only one fetch call after rapid keystrokes
- Lazy stats: verify batching respects max 5 per frame

### S36-06: E2E performance tests
- Load app with 50 stub documents → list renders in <300ms
- Scroll to bottom of list → items render without blank gaps
- Rapid typing → only 1 save request sent after 1500ms idle
- Memory: no observable leak after 100 open/close cycles of document list
