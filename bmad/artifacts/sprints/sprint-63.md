# Sprint 63 — Writing Statistics & Reading Time

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Surface meaningful writing stats to the user — reading time, readability score, sentence count, and progress against daily goal — in a lightweight StatsPanel component.

---

## Stories

### S63-01 — Writing stats utility
**File:** `src/lib/writingStats.ts`
Pure functions (no Svelte, easy to unit test):
- `wordCount(text): number` — whitespace-split, filter empty
- `sentenceCount(text): number` — split on `.!?` boundaries
- `paragraphCount(text): number` — split on double-newline
- `readingTimeMinutes(text): number` — words / 200, minimum 1
- `fleschReadingEase(text): number` — standard formula (0–100)
- `readabilityLabel(score): string` — "Very Easy" / "Easy" / … / "Very Difficult"

### S63-02 — StatsPanel component
**File:** `src/lib/elements/StatsPanel.svelte`
Props: `text: string`, `dailyGoal?: number` (default 0)
Displays:
- Words / Sentences / Paragraphs in a stat grid
- Reading time ("~3 min read")
- Readability score + label (colour-coded green→red)
- Daily goal progress bar (words / dailyGoal) — hidden when dailyGoal = 0

### S63-03 — Wire StatsPanel into editor layout
**File:** `src/routes/app/+page.svelte` or `EditorPanel.svelte`
- Add a "Stats" button to EditorFooter or the existing FooterBar
- Toggle StatsPanel visibility; panel slides up from the bottom of the editor
- Pass current `content` and `dailyTarget` from `goalsStore`

### S63-04 — Live word count badge update
**File:** `src/lib/elements/WordCountBadge.svelte`
- Ensure WordCountBadge uses the same `wordCount()` utility from S63-01
- Add reading time next to the word count: "342 words · ~2 min"

### S63-05 — Unit tests Sprint 63
- `wordCount`: empty, whitespace-only, single word, multi-word
- `sentenceCount`: no punctuation, single sentence, multi-sentence
- `readingTimeMinutes`: < 200 words → 1 min, 400 words → 2 min
- `fleschReadingEase`: known sentence produces expected score range
- `readabilityLabel`: boundary values map to correct labels

### S63-06 — E2E Sprint 63 (deferred)
- Type in editor → word count badge updates live
- Click Stats → StatsPanel shows correct reading time and readability

---

## Acceptance Criteria
- [ ] `writingStats.ts` exports all 6 functions
- [ ] StatsPanel displays all stats correctly
- [ ] WordCountBadge shows reading time
- [ ] 0 new test failures
