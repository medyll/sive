# Sprint 67 Planning — Community Gamification & Leaderboards

**Status:** Planning
**Target Date:** 2026-03-27
**Planned Stories:** 6
**Estimated Effort:** 5 days

---

## Sprint Goal

Implement competitive and collaborative leaderboards to drive engagement through gamification. Enable writers to see community rankings while respecting privacy settings.

---

## Context

**Completed in Sprint 66:**
- ✅ User profiles with goal stats
- ✅ Share goals links (referral-style)
- ✅ Accountability partners (follow feature)
- ✅ Milestone celebrations (confetti, notifications)
- ✅ 41 unit tests (100% passing)

**Ready to build:**
- Leaderboard infrastructure (queries, rankings)
- Weekly & all-time rankings
- Privacy-aware displays (anonymized by default)
- Tie-breaker logic (consistent sorting)
- Performance optimization (caching)

---

## Stories

### S67-01: Weekly Leaderboard (Top 10)
**Acceptance Criteria:**
- Display top 10 users by words written this week
- Show current user's rank if not in top 10
- Sortable by rank, username, week start date
- Anonymize by default (show @anon1, @anon2, etc.)
- Cache data (update hourly)
- Unit tests + basic e2e

**Why:** Time-based competition drives weekly engagement and habits.

**Files to Create:**
- `src/routes/leaderboard/weekly/+page.svelte`
- `src/routes/api/leaderboard/weekly/+server.ts`
- `src/lib/server/leaderboardQueries.ts`
- `src/lib/leaderboardStore.svelte.ts`
- Tests

---

### S67-02: All-Time Leaderboard (Top 10)
**Acceptance Criteria:**
- Top 10 users by consecutive streak (all-time)
- Alternative: Top 10 by total words written
- Toggle between views (Streaks / Total Words)
- Current user's rank highlighted
- Anonymized display
- Caching + refresh button
- Unit tests

**Why:** Celebration of sustained effort and major milestones.

**Files to Create:**
- `src/routes/leaderboard/alltime/+page.svelte`
- `src/routes/api/leaderboard/alltime/+server.ts`
- Update leaderboardQueries module
- Tests

---

### S67-03: Leaderboard Page Layout
**Acceptance Criteria:**
- Single page with tabs: Weekly | All-Time | My Rank
- "My Rank" section shows:
  - Current user's position
  - Points/words needed to reach next tier
  - Trend (↑ moved up, → held, ↓ moved down)
- Share leaderboard link (via ShareGoalsModal)
- Mobile responsive (horizontal scroll for wide leaderboard)
- Loading states + empty states
- Unit tests

**Why:** Central hub for competition, motivation, and sharing.

**Files to Create:**
- `src/routes/leaderboard/+page.svelte`
- `src/routes/leaderboard/+page.server.ts`
- `src/lib/elements/LeaderboardCard.svelte`
- `src/lib/elements/UserRankBadge.svelte`
- Tests

---

### S67-04: Leaderboard Privacy Settings
**Acceptance Criteria:**
- Settings toggle: "Show me on leaderboards" (default: OFF)
- When ON: display real username, show in rankings
- When OFF: anonymized as @anon{id}, excluded from rankings
- Leaderboard respects this setting on display
- Toast notification on toggle
- Persistent (localStorage + future DB)
- Unit tests

**Why:** Trust + GDPR-aligned. Users control visibility.

**Files to Create:**
- `src/lib/privacyStore.svelte.ts`
- API: `src/routes/api/privacy/leaderboard-visibility/+server.ts` (for future DB)
- Settings UI integration
- Tests

---

### S67-05: Leaderboard Caching & Performance
**Acceptance Criteria:**
- Cache leaderboard data in-memory (1-hour TTL)
- Invalidate cache when user's weekly goal is updated
- Provide manual "Refresh" button (bypasses cache)
- Show "Last updated: X minutes ago" timestamp
- Handle cache misses gracefully (fallback to live query)
- No N+1 queries (batch fetch user stats)
- Load time < 500ms for top 10
- Unit tests + performance notes

**Why:** Leaderboards can be expensive to compute; caching = fast UX.

**Files to Create:**
- `src/lib/server/leaderboardCache.ts`
- Update leaderboardQueries module
- Tests

---

### S67-06: Unit Tests (Sprint Coverage)
**Acceptance Criteria:**
- Tests for all leaderboard stores (leaderboardStore, privacyStore)
- Tests for all API endpoints (/leaderboard/weekly, /leaderboard/alltime)
- Tests for caching logic (TTL, invalidation)
- Tests for privacy filtering
- Tests for ranking calculations (tie-breakers, sorting)
- Minimum 80% coverage for new code
- Tests pass in CI

**Why:** Ensure consistency and prevent ranking bugs.

**Files to Create:**
- `src/lib/leaderboardStore.spec.ts`
- `src/lib/privacyStore.spec.ts`
- `src/lib/server/leaderboardQueries.spec.ts`
- `src/lib/server/leaderboardCache.spec.ts`
- `src/routes/api/leaderboard/weekly.spec.ts`
- `src/routes/api/leaderboard/alltime.spec.ts`

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Leaderboard queries slow down app | Implement caching (1-hr TTL) + pagination (top 10 only) |
| Privacy concerns (real names visible) | Default to anonymized; user controls visibility |
| Tie-breaker inconsistency | Define clear rules: streak > total words > timestamp |
| Stale data on display | Show "last updated" timestamp + refresh button |
| N+1 queries on ranking | Batch fetch user stats in single query |

---

## Dependencies & Blockers

- **No hard blockers.** All work builds on Sprint 66 foundation.
- Relies on: streakStore, weeklyGoalsStore, badgesStore (already stable)
- leaderboardCache needs to integrate with goalSave event (future: add event bus)

---

## Test Strategy

- **Unit tests:** Queries, caching, privacy filtering, ranking logic (6 spec files)
- **E2E smoke tests:** View leaderboard, toggle privacy, refresh (2-3 flows)
- **Manual testing:** Performance load, cache behavior, mobile UX

---

## Success Metrics

- ✅ All S67-01 through S67-05 stories complete
- ✅ Unit test suite passes (>80% coverage)
- ✅ E2E smoke tests pass
- ✅ Leaderboard loads in < 500ms
- ✅ Cache invalidation working correctly
- ✅ No privacy leaks (test with privacy ON/OFF)

---

## Notes

- **Story sizing:** S67-01, S67-02 are medium (3-4 hrs each). S67-03, S67-04, S67-05 are medium-large (4-5 hrs). S67-06 is continuous.
- **Tech stack:** Svelte 5 runes, SvelteKit, localStorage (MVP), no new dependencies.
- **Tie-breaker order:** consecutive streak → total words → timestamp (oldest first)
- **Cache invalidation:** On goal update, on streak change, manual refresh
- **Anonymization:** Keep @anon{userId.slice(0,8).hashCode % 9999} format consistent

---

## Next Steps (If Sprint 67 Approved)

1. Approve this plan
2. Run `bmad sprint 67 --auto` to create story files and begin S67-01 implementation
3. Developer takes lead on leaderboard queries + caching
4. Daily standups on progress
5. Commit & test daily

---

**Created:** 2026-03-26
**Planning Role:** PM
**Review:** Ready for dev team feedback or approval
