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

---

## Implementation Notes

**Date:** 2026-03-01
**Files changed:**
- `src/routes/app/+page.svelte` — Réécriture complète en Svelte 5 runes; split layout EditorPanel + ResizeHandle + AIPanel; drag-to-resize via `{@attach}`; persistence localStorage `sive.splitRatio`

**Notable decisions:**
- Svelte 5 `{@attach}` attachments pour les event listeners workspace (pointermove/pointerup) et la persistance localStorage, évitant `bind:this` + `$effect` au niveau du script
- `setPointerCapture` sur le resize-handle pour capturer les events même si la souris sort du handle
- Ratio clamped entre 0.2 et 0.8 pour éviter les panneaux trop étroits
- Toolbar stubs (Review, New version, ⚙) avec `aria-disabled` — wiring réel en S2-04

**Known limitations:**
- Toolbar actions non fonctionnelles (S2-04)
- Focus Mode non implémenté (S2-03)
- TabBar non intégré dans AIPanel (S2-02)
- ChatBar absent (S2-05)

