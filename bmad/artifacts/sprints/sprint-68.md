# Sprint 68 Planning — Partner Activity Feed & Social Notifications

**Status:** Planning
**Target Date:** 2026-03-27
**Planned Stories:** 6
**Estimated Effort:** 4–5 days

---

## Sprint Goal

Close the social loop by giving writers visibility into their partners' activity.
When an accountability partner earns a badge, hits a streak milestone, or climbs the leaderboard, the current user should know — driving mutual motivation and retention.

---

## Context

**Completed in Sprint 66–67:**
- ✅ User profiles with goal stats
- ✅ Share goals links
- ✅ Accountability partners (follow/unfollow)
- ✅ Milestone celebrations (confetti + toast)
- ✅ Weekly + all-time leaderboards (cached, privacy-aware)

**Gap to close:**
Partners exist but are passive — you follow someone but never hear from them again.
An activity feed turns passive follows into an active, motivating relationship.

---

## Stories

### S68-01: Activity Event Store
**Acceptance Criteria:**
- Local event store tracking activities: badge_earned, streak_milestone, leaderboard_entry, goal_completed
- Events stored per-user with timestamp, type, payload
- Max 100 events per user (ring buffer)
- Events emitted by celebrationStore, streakStore, leaderboardStore hooks
- Unit tests

**Why:** Central event bus for all social activity. All feed + notification features build on this.

**Files to Create:**
- `src/lib/activityStore.svelte.ts`
- Tests

---

### S68-02: Partner Activity Feed Component
**Acceptance Criteria:**
- Feed showing recent activity from followed partners
- Grouped by day ("Today", "Yesterday", "This week")
- Activity types displayed:
  - 🏆 `@alice earned the "7-Day Streak" badge`
  - 🔥 `@bob hit a 30-day streak!`
  - 📊 `@charlie reached #3 on the leaderboard`
  - ✅ `@diana completed their weekly goal`
- Empty state: "No activity yet — your partners will appear here"
- Unit tests

**Why:** Makes following meaningful. Writers see their partners' wins in real-time.

**Files to Create:**
- `src/lib/elements/PartnerActivityFeed.svelte`
- `src/lib/partnerFeedStore.svelte.ts`
- Tests

---

### S68-03: Notification Badge on Partners Section
**Acceptance Criteria:**
- Unread count badge on "Accountability Partners" section in settings
- Badge clears when user opens the feed
- Persists across page reloads (localStorage)
- Animated pulse on new unread (respects prefers-reduced-motion)
- Unit tests

**Why:** Passive discovery. Users notice new partner activity without checking manually.

**Files to Create:**
- Update `src/lib/elements/PartnersList.svelte` (add badge)
- `src/lib/feedUnreadStore.svelte.ts`
- Tests

---

### S68-04: Activity Feed Page
**Acceptance Criteria:**
- Route `/feed` showing full partner activity feed
- Infinite scroll (or "Load more" button) — max 50 events
- Filter by activity type (All | Badges | Streaks | Goals)
- Link to partner's profile from each activity item
- Mobile responsive
- Empty state with CTA to follow more writers
- Unit tests

**Why:** Dedicated hub for social activity. Gives the feed room to breathe.

**Files to Create:**
- `src/routes/feed/+page.svelte`
- Tests

---

### S68-05: Emit Activity Events from Existing Stores
**Acceptance Criteria:**
- streakStore emits `streak_milestone` at 7, 30, 100 days
- celebrationStore emits `badge_earned` when badge unlocked
- leaderboardStore emits `leaderboard_entry` when user enters top 10
- writingGoalsStore emits `goal_completed` when daily target hit
- All emissions are fire-and-forget (non-blocking)
- Unit tests verifying events are emitted

**Why:** Wires the activity pipeline end-to-end. Without this, the feed has no data.

**Files to Modify:**
- `src/lib/streakStore.svelte.ts`
- `src/lib/celebrationStore.svelte.ts`
- `src/lib/leaderboardStore.svelte.ts`
- `src/lib/writingGoalsStore.svelte.ts`
- Tests

---

### S68-06: Unit Tests (Sprint Coverage)
**Acceptance Criteria:**
- Tests for activityStore (emit, ring-buffer, query)
- Tests for partnerFeedStore (aggregation, grouping, unread)
- Tests for feedUnreadStore (count, clear)
- Tests for event emission hooks in existing stores
- Minimum 80% coverage for new code
- All tests pass

**Files to Create:**
- `src/lib/activityStore.spec.ts`
- `src/lib/partnerFeedStore.spec.ts`
- `src/lib/feedUnreadStore.spec.ts`

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Partner feed requires server-side sync | MVP uses local events only; partners see your data on profile visit |
| Event ring buffer grows stale | Cap at 100 events, clear on reset |
| Activity hooks slow down core stores | Fire-and-forget (microtask), non-blocking |
| Feed feels empty on first use | Seed with user's own recent activity as example |

---

## Dependencies & Blockers

- **No hard blockers.** Builds entirely on S66/S67 foundations.
- Partners list (S66-03) must exist — ✅ done
- celebrationStore (S66-04) used as emission point — ✅ done

---

## Success Metrics

- ✅ Activity feed shows partner events grouped by day
- ✅ Unread badge appears when partner activity exists
- ✅ `/feed` page accessible and mobile-responsive
- ✅ All event hooks wired to existing stores
- ✅ Unit test suite passes (>80% new coverage)

---

**Created:** 2026-03-26
**Planning Role:** PM
**Review:** Ready for dev
