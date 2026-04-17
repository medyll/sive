# Sprint 62 — Writing Stats & Readability Panel

**Sprint Duration:** 2026-03-25
**Status:** 🚀 Active
**Goal:** Surface live writing statistics (Flesch-Kincaid readability score, average sentence length, reading time, top word frequency) in a collapsible stats panel. Builds on the existing word/char count in EditorFooter and Writing Goals Bar.

---

## Stories

### S62-01 — writingStats utility
**File:** `src/lib/writingStats.ts`
- Pure functions (no Svelte reactivity) for easy unit testing:
  - `wordCount(text)` → number
  - `sentenceCount(text)` → number
  - `avgWordsPerSentence(text)` → number (1 decimal)
  - `readingTimeMinutes(text)` → number (assumes 200 wpm, 1 decimal)
  - `fleschKincaid(text)` → readability score 0–100 (standard FK Reading Ease formula)
  - `topWords(text, n)` → `{ word: string; count: number }[]` (excludes stop words)

### S62-02 — WritingStatsPanel component
**File:** `src/lib/elements/WritingStatsPanel.svelte`
- Props: `content: string`
- Displays:
  - Words / Sentences / Avg words/sentence
  - Reading time (e.g. "~2 min read")
  - Flesch-Kincaid score with label (90–100 Very Easy → 0–30 Very Difficult)
  - Top 5 words bar chart (CSS-only, relative widths)
- Collapsible with a toggle button
- Updates reactively as `content` changes (debounced 300 ms)

### S62-03 — Wire WritingStatsPanel into EditorFooter
**File:** `src/lib/elements/EditorFooter.svelte`
- Add a **Stats** toggle button in the footer
- When active, render `WritingStatsPanel` above the footer bar
- Persist open/closed state in `localStorage` under `sive.statsPanel`

### S62-04 — ReadabilityBadge in EditorFooter
**File:** `src/lib/elements/EditorFooter.svelte`
- Always-visible small badge showing FK score colour-coded:
  - Green (≥70 Easy), Amber (40–69 Moderate), Red (<40 Difficult)
- Tooltip shows full label on hover

### S62-05 — Unit tests Sprint 62
- `writingStats`: all 6 functions with known inputs/outputs
- `WritingStatsPanel`: renders correct word count, reading time, FK label

### S62-06 — E2E Sprint 62
- Type text in editor → Stats badge visible in footer
- Click Stats toggle → WritingStatsPanel expands
- Panel shows word count, reading time, FK score
- Panel collapses on second click

---

## Acceptance Criteria
- [ ] FK score computed correctly for sample text
- [ ] ReadabilityBadge colour updates as content changes
- [ ] WritingStatsPanel collapses/expands and persists state
- [ ] Top 5 words exclude common stop words
- [ ] 0 new test failures introduced
