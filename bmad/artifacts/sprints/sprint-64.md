# Sprint 64 — Writing Goals Dashboard & Streaks

**Sprint Duration:** 2026-03-25
**Status:** 🚀 Active
**Goal:** Extend the existing `WritingGoalBar` and `writingGoalsStore` with a full Goals Dashboard — daily word targets, streak tracking (consecutive writing days), and a 12-week contribution heatmap. Persisted in localStorage.

---

## Stories

### S64-01 — `streakStore.svelte.ts`
**File:** `src/lib/streakStore.svelte.ts`
- Tracks writing sessions by day (key: `YYYY-MM-DD`)
- `recordActivity(wordCount: number)` — logs words written today
- `streak: number` — current consecutive-day streak
- `longestStreak: number` — all-time longest streak
- `activityMap: Record<string, number>` — date → word count for heatmap
- Persisted in `localStorage` under `sive.streaks`

### S64-02 — `GoalsDashboard` component
**File:** `src/lib/elements/GoalsDashboard.svelte`
- Daily word goal input (default 500) — persisted in settings
- Today's progress: words written / goal, animated progress ring
- Current streak badge (🔥 N days)
- Longest streak badge
- 12-week heatmap grid (84 cells), colour intensity by word count:
  - 0 words → `#e5e7eb` (grey)
  - 1–99 → `#c4b5fd` (light purple)
  - 100–499 → `#8b5cf6` (medium)
  - 500+ → `#5b21b6` (dark)
- Tooltip on hover showing date + word count

### S64-03 — Wire `GoalsDashboard` into Settings panel
**File:** `src/routes/settings/+page.svelte`
- Add "Writing Goals" section with `GoalsDashboard`
- Daily goal slider (100–5000 words, step 50)

### S64-04 — Auto-record activity on save
**File:** `src/routes/app/+page.svelte`
- After each successful `handleSave`, call `streakStore.recordActivity(wordCount(activeContent))`
- This feeds the streak and heatmap without user action

### S64-05 — Unit tests Sprint 64
- `streakStore`: recordActivity updates today's count, streak increments on new day, gap in days resets streak, longestStreak tracks correctly
- `GoalsDashboard`: renders progress ring, streak badge, heatmap cells

### S64-06 — E2E Sprint 64
- Navigate to Settings → Writing Goals section visible
- Daily goal input present
- Heatmap grid rendered (84 cells)
- Streak badge visible

---

## Acceptance Criteria
- [ ] `streakStore` persists daily word counts to localStorage
- [ ] Streak resets after a day with no activity
- [ ] Heatmap shows 84 cells (12 weeks × 7 days)
- [ ] Daily goal progress ring updates as content changes
- [ ] 0 new test failures introduced
