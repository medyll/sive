# Sprint 57 — Editor Toolbar & Focus Mode Polish

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Add a proper editor toolbar with formatting actions (bold, italic, heading), polish focus mode (hide sidebar/toolbar), and add a word count display in the editor footer.

## Stories

### S57-01 — Editor formatting toolbar (bold, italic, heading)
- Toolbar above the editor with B / I / H1 / H2 buttons
- Dispatch `editor:format` CustomEvent with `{ type: 'bold'|'italic'|'h1'|'h2' }`
- Active state highlights current format at cursor

### S57-02 — Focus mode hides sidebar and toolbar
- When `focusMode = true`: hide DocumentList sidebar + app toolbar
- Only editor + WritingGoalBar remain visible
- Smooth CSS transition (opacity + transform)

### S57-03 — Word count footer in editor panel
- Show live word count + character count below the editor textarea
- Format: "123 words · 456 chars"
- Updates on every input event (debounced 300ms)

### S57-04 — Autosave indicator in toolbar
- Small dot indicator: grey (idle), amber (unsaved changes), green (saved)
- Transitions: idle → dirty on input, dirty → saving on autosave trigger, saving → idle on success

### S57-05 — Unit tests Sprint 57
- wordCount utility: empty, single word, multiple words, punctuation
- autosave indicator state machine transitions

### S57-06 — E2E Sprint 57
- Formatting toolbar visible on /app
- Focus mode hides sidebar
- Word count updates on typing
