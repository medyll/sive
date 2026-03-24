# Sprint 59 — AI Ghost Text & Inline Completions Polish

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Polish the GhostText inline AI suggestion UX — Tab to accept, Escape to dismiss, word-by-word partial accept, and a loading shimmer while the suggestion streams in.

---

## Stories

### S59-01 — Tab-to-accept ghost text
**File:** `src/lib/elements/GhostText.svelte`
- Listen for `keydown` Tab in the editor when ghost text is visible
- On Tab: insert the suggestion at the cursor position and clear ghost text
- Prevent default Tab (indent) behaviour when ghost text is active

### S59-02 — Escape to dismiss ghost text
**File:** `src/lib/elements/GhostText.svelte`
- On Escape: clear ghost text without inserting
- Ghost text should also auto-dismiss when the user types a character that no longer matches the suggestion prefix

### S59-03 — Partial accept (word-by-word with Ctrl+→)
**File:** `src/lib/elements/GhostText.svelte`
- On `Ctrl+→` (or `Ctrl+Right`): accept only the next word of the suggestion
- Remaining suggestion stays visible as ghost text
- Utility: `acceptNextWord(suggestion: string): { accepted: string; remaining: string }`

### S59-04 — Ghost text loading shimmer
**File:** `src/lib/elements/GhostText.svelte`
- While AI suggestion is being fetched (streaming), show an animated shimmer placeholder (3 blinking dots or a subtle pulse bar)
- Shimmer disappears and suggestion appears once the first token arrives

### S59-05 — Unit tests Sprint 59
- `acceptNextWord`: empty string, single word, multi-word, punctuation boundary
- GhostText dismiss logic: escape clears, tab inserts, mismatch clears
- Shimmer state: loading=true shows shimmer, loading=false shows text

### S59-06 — E2E Sprint 59
- Type in editor → AI suggestion appears as ghost text
- Press Tab → suggestion inserted into editor
- Press Escape → ghost text dismissed, editor unchanged
- Press Ctrl+→ → first word accepted, rest remains as ghost text

### S59-07 — Instrument Slash usage (telemetry)
**File:** `src/routes/api/telemetry` (or client-side emission)
- Emit events for open/select/execute/cancel
- Include anonymized user id, command id, and outcome

### S59-08 — Improve Slash keyboard navigation
**File:** `src/lib/components/SlashPalette.svelte`
- Arrow navigation, Enter to select, Escape to cancel, proper focus management

### S59-09 — Persist recently-used templates
**File:** `src/lib/server/templates.ts`
- Server-side persistence for recently-used templates per user

### S59-10 — Tests for Slash and templates
- Unit + E2E tests covering navigation, telemetry, and persistence

---

## Acceptance Criteria
- [ ] Tab accepts full ghost text suggestion
- [ ] Escape dismisses ghost text
- [ ] Ctrl+→ accepts one word at a time
- [ ] Loading shimmer shown while suggestion streams
- [ ] 0 new test failures introduced
