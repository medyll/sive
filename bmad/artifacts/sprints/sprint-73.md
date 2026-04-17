# Sprint 73 Planning — AI Features Expansion

**Status:** Planning  
**Target Date:** 2026-03-29  
**Planned Stories:** 6  
**Estimated Effort:** 2-3 days

---

## Sprint Goal

Expand AI-powered writing features with ghost text completions, inline rewrite tools, and outline generation.

---

## Context

**Current AI Features (S22, S23, S25):**
- ✅ AI Chat panel with streaming responses
- ✅ Context-aware suggestions (doc content included)
- ✅ Prompt history with recall arrows
- ✅ Document summaries (auto on save)

**Gap:** AI features are panel-based only. Writers need:
- Inline completions (ghost text) as they type
- Quick rewrite tools via selection toolbar
- AI-generated outlines for document structure

---

## Stories

### S73-01: Ghost Text — Tab to Accept

**Goal:** Show AI completions inline as ghost text while typing.

**Acceptance Criteria:**
- [ ] Ghost text appears after user pauses typing (500ms debounce)
- [ ] Tab key accepts ghost text completion
- [ ] Escape key dismisses ghost text
- [ ] Ghost text styled as faded/gray text
- [ ] Cursor positioned at end of accepted text
- [ ] Unit tests for ghost text logic

**Files to Create:**
- `src/lib/elements/GhostText.svelte` — Ghost text overlay component
- `src/lib/ghostTextStore.svelte.ts` — Ghost text state management
- `src/routes/api/ai/complete/+server.ts` — Completion endpoint

**Estimated Time:** 4-6 hours

---

### S73-02: Ghost Text — Partial Accept (Word-by-Word)

**Goal:** Accept ghost text word-by-word with repeated Tab presses.

**Acceptance Criteria:**
- [ ] First Tab accepts first word of ghost text
- [ ] Second Tab accepts second word
- [ ] Continue until all ghost text accepted or dismissed
- [ ] Visual indicator shows accepted portion
- [ ] Unit tests for partial accept logic

**Files to Modify:**
- `src/lib/elements/GhostText.svelte` — Add partial accept
- `src/lib/ghostTextStore.svelte.ts` — Track accepted words

**Estimated Time:** 2-3 hours

---

### S73-03: Selection Toolbar — Rewrite Actions

**Goal:** Show floating toolbar when text is selected with rewrite options.

**Acceptance Criteria:**
- [ ] Toolbar appears above selected text
- [ ] Actions: "Rewrite", "Expand", "Condense", "Change Tone"
- [ ] Rewrite replaces selection with AI version
- [ ] Expand adds more detail to selection
- [ ] Condense makes selection more concise
- [ ] Unit tests for toolbar logic

**Files to Create:**
- `src/lib/elements/SelectionToolbar.svelte` — Floating toolbar
- `src/lib/selectionToolbarStore.svelte.ts` — Toolbar state

**Estimated Time:** 4-6 hours

---

### S73-04: Tone Submenu Actions

**Goal:** Tone submenu with preset tone options.

**Acceptance Criteria:**
- [ ] Submenu with: Formal, Casual, Professional, Creative, Academic
- [ ] Selection rewritten in chosen tone
- [ ] Toast notification on success
- [ ] Undo available via Harden modal
- [ ] Unit tests for tone actions

**Files to Modify:**
- `src/lib/elements/SelectionToolbar.svelte` — Add tone submenu

**Estimated Time:** 2-3 hours

---

### S73-05: AI Outline Generator

**Goal:** Generate document outline from AI based on content/theme.

**Acceptance Criteria:**
- [ ] `/api/ai/outline` endpoint accepts doc content
- [ ] Returns structured outline (sections, subsections)
- [ ] OutlinePanel displays generated outline
- [ ] Click section to jump to that part of doc
- [ ] Option to insert outline at cursor position
- [ ] Unit tests for outline endpoint

**Files to Create:**
- `src/routes/api/ai/outline/+server.ts` — Outline endpoint
- `src/lib/outlineGenerator.ts` — Outline logic
- `src/lib/elements/OutlineGenerator.svelte` — Generator UI

**Estimated Time:** 4-6 hours

---

### S73-06: Unit Tests — AI Features

**Goal:** Comprehensive test coverage for new AI features.

**Acceptance Criteria:**
- [ ] Ghost text store tests (show, hide, accept, dismiss)
- [ ] Selection toolbar tests (position, actions)
- [ ] Outline generator tests (endpoint, parsing)
- [ ] Integration tests for AI rewrite flow
- [ ] 80%+ coverage for new code

**Files to Create:**
- `src/lib/ghostTextStore.spec.ts`
- `src/lib/selectionToolbarStore.spec.ts`
- `src/lib/outlineGenerator.spec.ts`

**Estimated Time:** 3-4 hours

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Ghost text conflicts with typing | Debounce 500ms, dismiss on any keystroke |
| Selection toolbar positioning | Use floating UI library, test edge cases |
| AI rewrite loses user intent | Show diff preview before applying |
| Outline generation slow | Show loading spinner, cache results |
| API rate limits | Implement client-side rate limiting |

---

## Dependencies

- ✅ S22: AI Chat Streaming (SSE endpoint exists)
- ✅ S23: AI Context Awareness (doc context pattern exists)
- ✅ S4: Harden Modal (undo available for rewrites)
- ✅ S20: Keyboard Shortcuts (Tab, Escape already handled)

---

## Success Metrics

- ✅ Ghost text appears and accepts correctly
- ✅ Selection toolbar shows on text selection
- ✅ Rewrite actions modify selected text
- ✅ Outline generator produces structured outline
- ✅ 80%+ test coverage for new features
- ✅ No regressions in existing AI chat features

---

## Alternative: Test Hardening Continuation

If AI features blocked by API/infrastructure:

### Sprint 73B — Remaining Placeholder Tests

**Stories:**
- S73B-01: Fix ShareGoalsModal Tests (5 tests)
- S73B-02: Fix WeeklyHistoryPanel Tests (6 tests)
- S73B-03: Fix Svelte Build Warnings (a11y, state, css)
- S73B-04: Create Test Patterns Documentation

---

## Recommendation

**Proceed with AI Features Sprint (S73)** because:
1. High user value — inline AI is highly requested
2. Builds on existing AI infrastructure (S22, S23)
3. Differentiates Sive from basic text editors
4. Can pivot to tests if API blocked

---

**Created:** 2026-03-28  
**Planning Role:** PM  
**Review:** Ready for dev
