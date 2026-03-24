# Sprint 58 — Document Templates & Quick Insert

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Polish the template picker UX, add a quick-insert slash command system in the editor, and add a recently-used templates section.

## Stories

### S58-01 — Slash command parser utility
- `parseSlashCommand(text: string): { command: string; query: string } | null`
- Detects `/word` at start of a line or after whitespace
- Returns command name + remaining query

### S58-02 — Slash command menu component
- `SlashMenu.svelte`: floating dropdown near cursor showing matching commands
- Commands: `/bold`, `/italic`, `/h1`, `/h2`, `/bullet`, `/divider`
- Keyboard: Arrow + Enter to select, Esc to dismiss

### S58-03 — Wire slash menu in editor
- Listen to `input` events on the editor textarea
- Show/hide `SlashMenu` based on slash command detection
- On select: apply format via `editor:format` CustomEvent + remove the slash token

### S58-04 — Recently used templates
- Track last 3 used template IDs in localStorage (`sive:templates:recents`)
- Show "Recent" section at top of TemplatePicker when recents exist

### S58-05 — Unit tests Sprint 58
- `parseSlashCommand`: empty, no slash, `/bold`, `/h1 text`, mid-word slash ignored
- recently used templates: add, deduplicate, cap at 3

### S58-06 — E2E Sprint 58
- Typing `/b` in editor opens slash menu
- Selecting bold from menu applies format
- TemplatePicker shows Recent section after using a template
