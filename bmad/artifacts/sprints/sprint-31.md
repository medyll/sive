# Sprint 31 — Inline AI Writing Suggestions

**Status:** planned
**Focus:** Surface AI suggestions directly inside the editor — ghost text autocomplete, selection-based rewrite, and tone nudges.
**Dates:** 2026-03-18

---

## Stories

### S31-01: Inline suggestion API endpoint
Create `src/routes/api/ai/suggest/+server.ts`:
- `GET /api/ai/suggest?ctx=<base64>&cursor=<int>&mode=complete|rewrite|tone`
- `mode=complete` → continue the sentence/paragraph (ghost text)
- `mode=rewrite` → rewrite selected text (replace selection)
- `mode=tone` → adjust tone of selected text (formal / casual / vivid)
- Stream response via SSE (`data: <token>\n\n`, `data: [DONE]\n\n`)
- Stub when `ANTHROPIC_API_KEY` absent (return lorem-style text word by word)
- Apply rate limiting via `checkWriteRateLimit`
- Validate inputs via `validateAIPrompt`

### S31-02: Suggestion store
Create `src/lib/suggestionStore.svelte.ts`:
- State: `{ pending: boolean, suggestion: string, mode: SuggestionMode, error: string|null }`
- `requestSuggestion(ctx, cursorPos, mode)` → calls API, streams into `suggestion`
- `acceptSuggestion()` → returns suggestion text, clears state
- `dismissSuggestion()` → clears state without inserting
- Cancel in-flight request on dismiss or new keypress
- Debounce auto-trigger: 800ms idle after last keystroke

### S31-03: Ghost-text overlay in editor
Enhance editor area (or create `src/lib/elements/GhostText.svelte`):
- Render ghost text inline after the cursor (CSS: `opacity: 0.4`, italic, `pointer-events: none`)
- Tab key → accept suggestion (insert ghost text, move cursor to end)
- Escape key → dismiss suggestion
- Any other keypress → dismiss + debounce new request
- Show/hide based on `suggestionStore.pending` and `suggestionStore.suggestion`
- Accessible: `aria-label="AI suggestion: <text>"`, role="status"

### S31-04: Selection-based suggestion toolbar
Create `src/lib/elements/SuggestionToolbar.svelte`:
- Appears as floating toolbar when user selects ≥ 10 chars of text
- Three buttons: ✨ Rewrite | 🎨 Make vivid | 📝 Formal
- Clicking a button → calls `requestSuggestion(selection, 0, mode)`
- Shows inline diff preview below selection (original vs. suggested)
- Accept / Dismiss buttons in diff preview
- Dismiss on click outside or Escape

### S31-05: Unit tests
- Suggestion store: pending state, streaming accumulation, accept/dismiss, cancel
- Inline suggestion API: stub mode, input validation, rate limit rejection
- Ghost text rendering logic (accept/dismiss key handlers)
- Diff preview generation (original vs. suggested)

### S31-06: E2E tests
- Type in editor → ghost text appears after 800ms idle
- Tab → accepts ghost text, cursor advances
- Escape → dismisses without inserting
- Select text → toolbar appears
- Click "Rewrite" → diff preview shown
- Accept rewrite → text replaced in editor
- Verify rate limit (429) handled gracefully in UI (no crash, show toast)

---

## Acceptance criteria

- [ ] Ghost text appears ≤ 1s after 800ms idle in editor
- [ ] Tab accepts, Escape dismisses ghost text
- [ ] Selection toolbar appears for ≥ 10 char selections
- [ ] Rewrite/tone modes show diff preview before committing
- [ ] All modes work in stub mode (no API key)
- [ ] Rate limit errors shown as toast, not crash
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Mobile: toolbar repositions correctly on small screens
