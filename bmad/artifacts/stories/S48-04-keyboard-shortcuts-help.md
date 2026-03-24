---
id: S48-04
sprint: 48
title: keyboard-shortcuts-help
status: done
---

# S48-04 — KeyboardShortcutsHelp Modal (`?` Key Trigger)

## Goal
Modal listing all keyboard shortcuts, opened by pressing `?` anywhere in the app.

## Acceptance Criteria
- [ ] `?` key (shift+/) opens the modal globally
- [ ] Modal lists shortcuts grouped by category (Editor, Navigation, AI, Export)
- [ ] Each row shows key combo + description
- [ ] Escape or clicking outside closes modal
- [ ] Modal does not open when focus is in an input/textarea

## Notes
Component at `src/lib/elements/KeyboardShortcutsHelp.svelte` (may already exist from S19–S23 — extend if so).
