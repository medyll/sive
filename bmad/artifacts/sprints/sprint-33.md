# Sprint 33 — User Dashboard & Writing Statistics

**Status:** planned
**Focus:** Surface writing progress — word counts, daily activity heatmap, streak tracking, per-document stats.
**Dates:** 2026-03-17

---

## Stories

### S33-01: Stats computation engine
Create `src/lib/server/stats.ts`:
- `countWords(text: string): number` — split on whitespace, ignore empty tokens
- `countSentences(text: string): number` — split on `.!?` boundaries
- `countParagraphs(text: string): number` — split on double newline
- `readingTimeMinutes(text: string): number` — words / 200 wpm, ceil
- `computeDocStats(doc): DocStats` — all of the above + charCount
- `computeUserStats(docs): UserStats`:
  - totalWords, totalDocs, totalChars
  - avgWordsPerDoc
  - longestDoc: { id, title, words }
  - mostRecentEdit: timestamp
  - activityByDay: Record<YYYY-MM-DD, wordsAdded> (last 30 days, estimated from updated_at)
  - currentStreak: consecutive days with ≥1 edit (use updated_at dates)
  - longestStreak: max consecutive days

### S33-02: Stats API endpoint
Create `src/routes/api/stats/+server.ts`:
- `GET /api/stats` — returns `UserStats` for authenticated user
- `GET /api/stats/doc/:id` — returns `DocStats` for one document
- Fetch documents from DB (same RBAC as `/app`)
- Rate-limited; guest returns zeroed stats

### S33-03: Dashboard page
Create `src/routes/dashboard/+page.svelte` + `+page.server.ts`:
- Server load: fetch stats + recent docs (last 5 modified)
- Layout: full-width with responsive grid
- Sections:
  1. **Hero row** — total words, total docs, current streak, avg words/doc (4 stat cards)
  2. **Activity heatmap** — 30-day calendar grid (Mon–Sun columns), cell colour intensity by words added
  3. **Top documents** — sorted by word count, shows title + word count + last edited
  4. **Reading time** — "Your writing would take X minutes to read"
- Link from main toolbar: "Dashboard" nav item

### S33-04: Per-document stat badge
Enhance editor area or document header:
- Show small `WordCountBadge.svelte` below the title input
- Displays: `1,234 words · 5 min read · 8 paragraphs`
- Updates live as user types (debounced 500ms, client-side only — no API call)
- Show/hide toggle in settings (default: visible)

### S33-05: Unit tests
- `countWords` edge cases: empty, multiple spaces, tabs, newlines, punctuation-only
- `countSentences`, `countParagraphs`, `readingTimeMinutes`
- `computeUserStats`: streak calculation, activityByDay bucketing, longestDoc
- Stats API: guest returns zeros, authenticated returns real data

### S33-06: E2E tests
- Navigate to `/dashboard` → all 4 stat cards visible
- Word counts are non-negative numbers
- Activity heatmap renders 30 cells
- Top documents list is non-empty after creating docs
- `WordCountBadge` updates as user types in editor
- Dashboard accessible from toolbar nav link

---

## Acceptance criteria

- [ ] `countWords` accurate to ±1 for typical prose
- [ ] Streak resets correctly when a day is skipped
- [ ] Dashboard loads in <500ms (server-rendered)
- [ ] Activity heatmap shows correct 30-day window
- [ ] Word count badge updates within 600ms of keystroke
- [ ] Guest user sees dashboard with zeroed stats (no error)
- [ ] All unit tests pass
- [ ] All E2E tests pass
