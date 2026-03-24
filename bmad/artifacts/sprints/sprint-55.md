# Sprint 55 — Palette Command Handlers

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Wire all remaining unhandled palette CustomEvents in +page.svelte so every command in the palette actually does something.

## Missing handlers to add
- `palette:newDocument` → handleNewDocument()
- `palette:toggleFocus` → focusMode = !focusMode
- `palette:showShortcuts` → showShortcutsHelp = true
- `palette:toggleTheme` → themeStore.setTheme(toggle)
- `palette:summarize` → showSummaryPanel = true
- `palette:openAIChat` → chatBarOpen = true
- `palette:exportPDF` → trigger ExportButton PDF action
- `palette:exportMarkdown` → trigger ExportButton MD action
- `palette:duplicateDocument` → duplicate active doc
- `palette:deleteDocument` → handleDelete(activeDocumentId)
