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

---

## Implementation Notes

**Date:** 2026-03-01
**Files changed:**
- `src/routes/app/+page.svelte` — Ajout de `focusMode` (`$state` + localStorage `sive.focusMode`); listener clavier global (`F11` / `Ctrl+Shift+F`) via `{@attach globalKeyboardShortcuts}` sur `window`; bouton Focus dans toolbar; badge `#suggestions-ready-badge` conditionnel (`focusMode && suggestionsReady`)

**Notable decisions:**
- Listener sur `window` (pas sur le div) pour capturer `F11` et `Ctrl+Shift+F` quelle que soit la position du focus dans la page
- `suggestionsReady` stubé à `false` — sera câblé au résultat AI dans un sprint ultérieur
- Badge en `position: fixed` bottom-right avec animation `pulse` — discret sans bloquer l'UI
- `persistState` attachment consolidé : persiste `splitRatio` et `focusMode` dans le même `$effect`

**Known limitations:**
- `suggestionsReady` non câblé (stub) — Sprint 3+
- `F11` peut être intercepté par le navigateur en plein écran selon le contexte — le `Ctrl+Shift+F` est le fallback fiable

