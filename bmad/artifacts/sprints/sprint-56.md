# Sprint 56 — Settings Polish & Palette Search UX

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Polish the settings page (theme picker, writing goal UI), improve command palette search UX, and add missing keyboard shortcut hints in the UI.

## Stories

### S56-01 — Theme picker in settings with live preview
- Replace radio buttons with a visual card picker (light/dark/system)
- Live preview applies theme immediately on click (persisted on save)

### S56-02 — Writing goal progress bar in toolbar
- Show a mini progress bar in the toolbar showing daily word count vs. goal
- Color: green when met, amber when < 80%, grey when no goal set

### S56-03 — Palette search: recent commands
- Track last 5 used commands in localStorage
- Show "Recent" section at top of palette when query is empty

### S56-04 — Keyboard shortcut hints in palette items
- Show `⌘K`, `⌘S`, `?` etc. next to palette items that have shortcuts
- Data comes from commandRegistry shortcut field

### S56-05 — Unit tests Sprint 56
- themeStore: test system preference detection
- writingGoalsStore: test progress bar color derivation
- commandRegistry: test shortcut field on registered commands

### S56-06 — E2E Sprint 56
- Settings theme picker switches theme live
- Toolbar progress bar reflects word count
- Palette shows recent commands section
