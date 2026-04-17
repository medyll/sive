---
id: S20-04
sprint: 20
title: keyboard-shortcut-help-overlay
status: done
---

# S20-04 — Keyboard Shortcut Help Overlay (? Key)

## Goal
Create a KeyboardShortcutsHelp modal that opens when ? is pressed outside a text input.

## Acceptance Criteria
- [ ] ? key opens KeyboardShortcutsHelp modal
- [ ] Modal lists all keyboard shortcuts
- [ ] Guard: ? does not trigger when in input/textarea/contenteditable

## Notes
KeyboardShortcutsHelp.svelte; showShortcutsHelp = $state(false) in app page.
