# Sprint 12 — UX Polish & Export

**Status:** ✅ Done  
**Goal:** Solidifier l'expérience utilisateur — états vides, skeleton loader, export de documents, sidebar collapsible, toast notifications, responsivité mobile.

---

## Stories

| ID | Titre | Status |
|----|-------|--------|
| S12-01 | Loading/saving indicators polish — skeleton loader DocumentList | ✅ Done |
| S12-02 | Empty states — DocumentList (no docs) + AI tabs (before first run) | ✅ Done |
| S12-03 | ExportButton.svelte — Markdown + TXT via Blob download | ✅ Done |
| S12-04 | Mobile responsiveness — sidebar collapse, media queries, stacked layout | ✅ Done |
| S12-05 | Toast notifications — toastStore.svelte.ts + Toast.svelte component | ✅ Done |
| S12-06 | Unit tests — Toast (4), toastStore (6), ExportButton (4) | ✅ Done |
| S12-07 | E2E tests — export, sidebar toggle, AI empty states (6 tests) | ✅ Done |

---

## Key decisions

- **Sidebar toggle**: always visible (desktop + mobile), `☰` button with `aria-label` toggle.
- **Toast**: singleton store, auto-dismiss (3.5s success, 5s error), slide-in animation. Wired to `handleSave`.
- **Export**: pure client-side Blob download, no server round-trip. Dropdown menu with backdrop.
- **Empty states**: AI tabs show hint text when list is empty and not loading. DocumentList shows "No documents yet + Create one →".
- **Skeleton loader**: shimmer animation on 3 placeholder rows (controlled via `loading` prop).
- **Mobile**: `@media (max-width: 767px)` — sidebar full-width stacked, panels flex-col, resize handle hidden.

---

## Test coverage

- **Unit**: 124 tests (+14 new)
- **E2E**: 6 new tests in `e2e/ux-polish.spec.ts`

---

## Files created

- `src/lib/toastStore.svelte.ts`
- `src/lib/elements/Toast.svelte`
- `src/lib/elements/ExportButton.svelte`
- `src/lib/elements/Toast.svelte.spec.ts`
- `src/lib/toastStore.spec.ts`
- `src/lib/elements/ExportButton.svelte.spec.ts`
- `e2e/ux-polish.spec.ts`
- `bmad/artifacts/sprints/sprint-12.md`

## Files modified

- `src/lib/elements/DocumentList.svelte` — `loading` prop + skeleton + empty state
- `src/lib/elements/AIPanel.svelte` — empty state hints in Suggestions/Coherence/Style tabs
- `src/routes/app/+page.svelte` — ExportButton, Toast, sidebarOpen, toastStore, mobile CSS
