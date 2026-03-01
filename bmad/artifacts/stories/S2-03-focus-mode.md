# S2-03 — Focus Mode

**Sprint:** 2 | **Epic:** UI Shell | **Points:** 3 | **Priority:** Must
**Depends on:** S2-01

## Goal

Implement Focus Mode: a keyboard shortcut hides the right panel (AIPanel + resize handle) for distraction-free writing. When AI suggestions are ready while in focus mode, a discreet badge appears.

## Acceptance Criteria

- [ ] Pressing `F11` or `Ctrl+Shift+F` toggles Focus Mode
- [ ] In Focus Mode: AIPanel and ResizeHandle are hidden; EditorPanel takes full width
- [ ] Exiting Focus Mode restores the previous split ratio
- [ ] A `suggestions-ready-badge` (dot indicator) is visible in Focus Mode when `suggestionsReady = true`
- [ ] Badge is **not** visible when not in focus mode (right panel visible is sufficient)
- [ ] Focus Mode state persists in localStorage key `sive.focusMode` (restored on page load)

## Implementation Notes

- Add `$state focusMode: boolean` in `src/routes/app/+page.svelte`
- Listen for keydown on `window` using `$effect` with cleanup
- Use `badge` mockup (`src/lib/elements/mockups/badge.svelte`) as reference for the indicator
- `suggestionsReady` is a prop / stub `$state` for now — will be wired to AI results in a later sprint
- Shortcut: `F11` alone, or `Ctrl+Shift+F` (check both `e.key` conditions)

## References

- `src/lib/elements/mockups/badge.svelte`
- `bmad/references/sive-layout.html` — `#suggestions-ready-badge`
- `bmad/references/project/1-interface-architecture.md` — §1.2 Focus Mode
