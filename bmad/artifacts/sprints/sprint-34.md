# Sprint 34 — Command Palette (Cmd+K)

**Status:** planned
**Focus:** Unified keyboard-driven command palette — search documents, run actions, trigger AI, navigate — all from one Cmd+K interface.
**Dates:** 2026-03-17

---

## Stories

### S34-01: Command registry
Create `src/lib/commandRegistry.ts`:
- `Command` type: `{ id, label, keywords[], category, icon?, action, shortcut? }`
- Categories: `navigation | document | ai | settings | view`
- Static commands registered at startup:
  - navigation: Go to Dashboard, Go to Settings, Go to Profile
  - document: New Document, Duplicate, Delete, Export PDF, Export Markdown
  - ai: Summarize Document, Open AI Chat, Toggle Context Mode
  - view: Toggle Focus Mode, Toggle Dark Mode, Keyboard Shortcuts
- `registerCommand(cmd)` / `unregisterCommand(id)` for dynamic commands
- `searchCommands(query): Command[]` — fuzzy label + keyword match, ranked by relevance

### S34-02: Command palette store
Create `src/lib/commandPaletteStore.svelte.ts`:
- State: `{ open, query, results, selectedIndex, recentIds[] }`
- `openPalette()` / `closePalette()` / `togglePalette()`
- `setQuery(q)` → recompute results (commands + document search results merged)
- `selectNext()` / `selectPrev()` — wrap around
- `executeSelected()` — run action, close palette, add to recents
- Recent commands: last 5, shown when query is empty
- Persist recents to localStorage (`sive:palette:recents`)

### S34-03: Command palette UI
Create `src/lib/elements/CommandPalette.svelte`:
- Full-screen backdrop + centered modal (max-w: 560px)
- Search input auto-focused on open
- Grouped results: Recent | Navigation | Document | AI | Settings
- Each row: icon + label + category tag + shortcut badge (if any)
- Keyboard: ArrowUp/Down to move, Enter to execute, Escape to close
- Empty state: "No commands found" with search tip
- Animate in/out (scale + fade, 150ms)
- Accessible: `role="combobox"`, `aria-activedescendant`, `role="listbox"`

### S34-04: Global keyboard binding + integration
Wire palette into the app shell:
- `Cmd+K` / `Ctrl+K` → open palette (global `keydown` listener in root layout)
- `Cmd+Shift+P` → also opens (VS Code muscle memory)
- When a document is open, inject dynamic commands: Rename, Tag, Share, Summarize
- Palette document search results navigate directly to that doc
- Palette AI commands trigger existing stores (suggestionStore, summaryStore)

### S34-05: Unit tests
- `searchCommands`: fuzzy match, keyword match, ranking, empty query returns recents
- Store: open/close, selectedIndex wrapping, executeSelected adds to recents
- Recent commands: capped at 5, persisted to localStorage, deduplication

### S34-06: E2E tests
- Cmd+K opens palette
- Typing filters commands in real time
- ArrowDown selects next item, Enter executes
- Escape closes without executing
- "New Document" command creates a document
- Recent commands appear on empty query after execution
- Palette accessible (role=combobox, aria-activedescendant)

---

## Acceptance criteria

- [ ] Cmd+K opens palette from anywhere in the app
- [ ] Typing filters by label and keywords (fuzzy)
- [ ] Keyboard navigation (↑↓ Enter Esc) fully functional
- [ ] Executing a command closes the palette
- [ ] Recent commands (last 5) shown on empty query
- [ ] Document search results integrated (top 3)
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No flash of unstyled content on open
