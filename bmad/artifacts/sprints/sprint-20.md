# Sprint 20 — Document Search & Power-User UX

**Duration:** 2026-03-17 → 2026-03-31
**Capacity:** 18 story points

## Sprint Goal

Add document search/filtering to the sidebar, expand the keyboard shortcut system with navigation shortcuts and a discoverable help overlay, fix the latent `suggestionsReady` undeclared-variable bug, and make the document list fully keyboard-navigable with arrow keys.

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---|---|---|
| S20-01 | UX | Document search/filter input in DocumentList sidebar | 3 | Must |
| S20-02 | UX | Arrow-key navigation in DocumentList | 2 | Must |
| S20-03 | Power UX | Expand keyboard shortcuts (new doc, toggle sidebar, next/prev doc) | 3 | Must |
| S20-04 | Power UX | Keyboard shortcut help overlay (? key) | 3 | Should |
| S20-05 | Bug | Fix undeclared `suggestionsReady` in app page (latent ReferenceError) | 1 | Must |
| S20-06 | QA | Unit tests for S20-01 → S20-05 | 4 | Must |

**Total:** 16 points

## Definition of Done

- [ ] DocumentList shows a search input that filters documents by title in real time
- [ ] Arrow Up/Down keys navigate the document list; Enter selects
- [ ] Ctrl+N creates a new document, Ctrl+B toggles sidebar, Ctrl+] / Ctrl+[ cycle documents
- [ ] Pressing `?` (outside a text input) opens a keyboard shortcut reference overlay
- [ ] `suggestionsReady` is declared as `$state(false)` in app page (no more silent undefined)
- [ ] Unit tests cover filter logic, arrow navigation, and shortcut dispatch

## Implementation Notes

- S20-01: add `let searchQuery = $state('')` + `$derived` filtered list; search input in `.doc-list-header` below the title row; clear button when query non-empty
- S20-02: add `onkeydown` to `.doc-list-items` (role="listbox") — ArrowUp/ArrowDown change a `focusedIndex` state, Enter fires `onSelect`
- S20-03: extend `globalKeyboardShortcuts` in `+page.svelte` — guard against firing when `e.target` is an input/textarea/contenteditable
- S20-04: `KeyboardShortcutsHelp.svelte` modal; toggled by `showShortcutsHelp = $state(false)` in app page; rendered alongside `HardenModal`
- S20-05: one-line fix — add `let suggestionsReady = $state(false);` after `aiProcessing`
