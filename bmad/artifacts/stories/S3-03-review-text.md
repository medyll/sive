# S3-03 — ReviewText Component

**Sprint:** 3 | **Epic:** Review Mode | **Points:** 2 | **Priority:** Must

## Goal

Create the `ReviewText` component — a read-only text panel that shows the manuscript text, with support for highlighted (flagged) passages.

## Acceptance Criteria

- [ ] `src/lib/elements/ReviewText.svelte` created (Svelte 5 runes)
- [ ] Read-only text area (no editing); `contenteditable="false"` or `readonly` attribute
- [ ] Renders `text: string` prop as formatted prose
- [ ] Stub text displayed when `text` prop is empty (sample paragraph)
- [ ] `highlights: Array<{start: number, end: number, category: string}>` prop; highlighted spans rendered with `data-category` attribute and distinct background per category
- [ ] Clicking a highlighted span calls `onHighlightClick(highlight)` prop if provided
- [ ] Accessible: `role="document"`, `aria-label="Manuscript text — read only"`

## References

- `bmad/references/sive-layout.html:213-220` — read-only text panel spec
- `src/lib/elements/EditorPanel.svelte` — structural reference
