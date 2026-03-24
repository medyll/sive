---
id: S34-03
sprint: 34
title: command-palette-ui
status: done
---

# S34-03 — Command Palette UI

## Goal
Create CommandPalette.svelte with full-screen backdrop, grouped results, keyboard navigation, and accessibility.

## Acceptance Criteria
- [ ] Full-screen backdrop + centered modal (max-w: 560px)
- [ ] Search input auto-focused on open
- [ ] Grouped results: Recent | Navigation | Document | AI | Settings
- [ ] Each row: icon + label + category tag + shortcut badge
- [ ] Keyboard: ArrowUp/Down, Enter, Escape
- [ ] Empty state: "No commands found"
- [ ] Animate in/out (scale + fade, 150ms)
- [ ] Accessible: role="combobox", aria-activedescendant, role="listbox"

## Notes
src/lib/elements/CommandPalette.svelte.
