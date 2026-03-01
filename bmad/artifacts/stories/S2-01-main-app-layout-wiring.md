# S2-01 — Main App Layout Wiring

**Sprint:** 2 | **Epic:** UI Shell | **Points:** 5 | **Priority:** Must

## Goal

Wire `src/routes/app/+page.svelte` to display the full split-screen writing interface: EditorPanel (left, 55%) + ResizeHandle (horizontal) + AIPanel (right, 45%). The split ratio must be draggable and persisted in localStorage.

## Acceptance Criteria

- [ ] `src/routes/app/+page.svelte` renders EditorPanel and AIPanel side-by-side in a flex row
- [ ] A ResizeHandle (`resize-handle` mockup) sits between the two panels; dragging it resizes both panels
- [ ] Default split is 55% / 45%
- [ ] Persisting the ratio: on next load, the stored ratio is restored from localStorage key `sive.splitRatio`
- [ ] Layout fills the viewport height (full-height)
- [ ] No visible regressions on the `/auth` route

## Implementation Notes

- Use the `resize-handle` mockup in `src/lib/elements/mockups/resize-handle.svelte` as the reference for drag logic
- The `panel` mockup defines the flex/resize container pattern
- EditorPanel and AIPanel already exist — this story is purely about wiring them into a page layout
- Keep a `$state` variable `splitRatio: number` (0–1) in the page; pass `width` as inline style to each panel

## References

- `src/lib/elements/EditorPanel.svelte`
- `src/lib/elements/AIPanel.svelte`
- `src/lib/elements/mockups/resize-handle.svelte`
- `src/lib/elements/mockups/panel.svelte`
- `bmad/references/sive-layout.html` — `#editor-panel`, `#split-handle`, `#ai-panel`
- `bmad/references/project/1-interface-architecture.md` — §1.1 Resizable Split-Screen
