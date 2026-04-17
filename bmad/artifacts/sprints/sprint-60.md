# Sprint 60 — AI Rewrite & Tone Tools

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Surface the existing `rewrite` and `tone` suggestion modes with a selection-based floating toolbar. When the user selects text, show a mini AI toolbar with Rewrite and Tone options that stream a replacement suggestion via ghost text.

---

## Stories

### S60-01 — SelectionToolbar component
**File:** `src/lib/elements/SelectionToolbar.svelte`
- Floating toolbar that appears above selected text in the editor
- Positioned via `getBoundingClientRect()` on the current selection
- Buttons: **Rewrite** (✏️) and **Tone** (🎨) with a tone submenu (Formal, Casual, Concise, Expand)
- Dismisses on `Escape` or click outside

### S60-02 — Wire SelectionToolbar in EditorPanel
**File:** `src/lib/elements/EditorPanel.svelte`
- Listen to `selectionchange` events; show SelectionToolbar when selection length > 0
- Pass selected text to SelectionToolbar
- Hide toolbar when selection is cleared

### S60-03 — Rewrite action
- Clicking **Rewrite** calls `requestSuggestionNow(ctx, 'rewrite', selection)`
- Ghost text shows the suggested rewrite
- On Tab-accept: replace the selected text with the suggestion
- On Escape: dismiss without change

### S60-04 — Tone submenu actions
- Tone submenu options map to `requestSuggestionNow(ctx, 'tone', tone + ':' + selection)`
- Same accept/dismiss flow as S60-03
- Tone label shown in ghost text hint area (e.g. "Formal rewrite — Tab to accept")

### S60-05 — Unit tests Sprint 60
- SelectionToolbar: renders with selection, hidden without selection
- Tone submenu: opens on click, correct option dispatches correct mode
- `requestSuggestionNow` called with correct mode/selection params

### S60-06 — E2E Sprint 60
- Select text in editor → SelectionToolbar appears
- Click Rewrite → ghost text suggestion streams in
- Tab → selection replaced with suggestion
- Escape → selection unchanged

---

## Acceptance Criteria
- [ ] SelectionToolbar appears on text selection
- [ ] Rewrite triggers ghost text with rewrite suggestion
- [ ] Tone submenu works for all 4 tones
- [ ] Tab-accept replaces selected text
- [ ] 0 new test failures introduced
