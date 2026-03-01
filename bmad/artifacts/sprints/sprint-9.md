# Sprint 9 — Document UX

**Duration:** 2026-03-01 → 2026-03-08
**Capacity:** ~12 story points

## Sprint Goal

Users can rename and delete documents, edit the active document title from the toolbar, and save manually with Ctrl+S. Document management is fully functional.

## Stories

| ID | Title | Points | Priority |
|---|---|---:|---|
| S9-01 | Inline title edit in DocumentList | 3 | Must |
| S9-02 | deleteDocument server action | 2 | Must |
| S9-03 | Toolbar title inline edit | 2 | Must |
| S9-04 | Ctrl+S manual save shortcut | 2 | Should |
| S9-05 | Unit tests — DocumentList | 2 | Should |
| S9-06 | E2E — document UX flow | 1 | Should |

**Total:** 12 pts

## Dependencies

- S9-01 must be done before S9-02, S9-03, S9-05, S9-06

## Definition of Done

- [ ] Click a doc title in sidebar → editable input → Enter/blur saves
- [ ] Trash button per doc → confirm → doc deleted, switch to next
- [ ] Toolbar project-label → click to edit → syncs with sidebar
- [ ] Ctrl+S in editor triggers immediate save
- [ ] Unit tests pass for DocumentList interactions
- [ ] E2E tests pass for rename, delete, Ctrl+S
