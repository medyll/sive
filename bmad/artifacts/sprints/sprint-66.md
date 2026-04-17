# Sprint 66 Planning — Social Sharing & Community Features

**Status:** Planning
**Target Date:** 2026-03-26
**Planned Stories:** 6
**Estimated Effort:** 5 days

---

## Sprint Goal

Expand goal-sharing capabilities to include community features, user profiles, and social interactions. Enable writers to view others' progress, celebrate milestones together, and build accountability partnerships.

---

## Context

**Completed in Sprint 65:**
- ✅ Goal templates system
- ✅ Achievement badges (7 badges across streaks + word counts)
- ✅ Share Goals & Streaks modal (clipboard copy + link sharing)
- ✅ Weekly goal reset & history tracking
- ✅ All unit tests

**Ready to build:**
- Public/private sharing settings
- User profile with goal stats
- Follow/friend system for accountability
- Leaderboard (optional weekly/monthly)
- Achievement showcase

---

## Stories

### S66-01: User Profiles with Goal Stats
**Acceptance Criteria:**
- Profile page showing: name, bio, current streak, longest streak, total words, badges earned
- Stats aggregation from goalsStore + badgesStore + weeklyGoalsStore
- Privacy settings: public/private profile
- Profile URL shareable (e.g., `/profile/@username`)
- Unit tests + basic e2e

**Why:** Foundation for social features. Users need a way to showcase their writing journey.

**Files to Create:**
- `src/routes/profile/[username]/+page.svelte`
- `src/routes/profile/[username]/+page.server.ts`
- `src/lib/elements/UserProfileCard.svelte`
- `src/lib/userProfileStore.svelte.ts`
- Tests

---

### S66-02: Share Goals Link (Referral Style)
**Acceptance Criteria:**
- Generate shareable short link (e.g., `sive.app/goals/abc123`)
- Link leads to read-only goal summary view (no login required)
- Summary shows: current streak, longest streak, weekly stats, achievements
- Link expires after 30 days or on user request
- Toast notification on link copy
- Unit tests

**Why:** Extend sharing beyond copy-paste. Trackable, clean, shareable links.

**Files to Create:**
- `src/routes/goals/[linkId]/+page.svelte`
- `src/routes/api/goals/create-share-link/+server.ts`
- `src/routes/api/goals/revoke-share-link/+server.ts`
- `src/lib/shareLinksStore.svelte.ts`
- Tests

---

### S66-03: Accountability Partners (Follow Feature)
**Acceptance Criteria:**
- Follow button on user profiles
- "My Partners" list in dashboard showing who you follow
- Partners' current streaks visible at a glance
- Click to view partner's shared profile
- Unfollow functionality
- Followers/following counts
- Unit tests + basic e2e

**Why:** Social accountability drives habit formation. Users want to see friends' progress.

**Files to Create:**
- `src/lib/partnersStore.svelte.ts`
- `src/lib/elements/PartnersList.svelte`
- `src/routes/api/partners/follow/+server.ts`
- `src/routes/api/partners/unfollow/+server.ts`
- Tests

---

### S66-04: Milestone Celebrations (Toast + Badge Pop)
**Acceptance Criteria:**
- Toast notification when badge earned (e.g., "🎉 7-day streak achieved!")
- Confetti animation on new badge earn (optional)
- Trophy emoji highlight on GoalsDashboard when milestone reached
- Sound notification option (accessibility: respects prefers-reduced-motion)
- Unit tests

**Why:** Positive reinforcement for habit formation. Motivates continued streaks.

**Files to Create:**
- `src/lib/elements/MilestoneNotification.svelte`
- `src/lib/celebrationStore.svelte.ts`
- `src/lib/confetti.ts` (animation utility)
- Tests

---

### S66-05: Weekly Leaderboard (Optional/Bonus)
**Acceptance Criteria:**
- Top 10 users by words written this week (if public profiles enabled)
- Top 10 users by streak (all-time)
- Current user's rank highlighted
- Toggle between weekly / all-time views
- Anonymized by default (show @anon1, @anon2, etc.)
- Unit tests

**Why:** Gamification element. Non-essential but motivating for competitive users.

**Note:** Conditional on privacy/database schema. May defer to S66-06 if schema updates needed.

**Files to Create:**
- `src/routes/leaderboard/+page.svelte`
- `src/routes/api/leaderboard/weekly/+server.ts`
- `src/routes/api/leaderboard/alltime/+server.ts`
- Tests

---

### S66-06: Unit Tests (Sprint Coverage)
**Acceptance Criteria:**
- Tests for all new stores (userProfileStore, partnersStore, shareLinksStore, celebrationStore)
- Tests for all new components (UserProfileCard, PartnersList, MilestoneNotification)
- Tests for API endpoints (/goals/create-share-link, /partners/follow, /leaderboard)
- Minimum 80% coverage for new code
- Tests pass in CI

**Why:** Ensure stability and regression prevention as social features scale.

**Files to Create:**
- `src/lib/*.spec.ts` (all stores)
- `src/lib/elements/*.spec.ts` (all components)
- `src/routes/api/**/*.spec.ts` (API endpoints)

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Privacy concerns (profiles publicly visible) | Implement privacy toggle from day 1. Default to private. Clear UI. |
| DB schema needs user/profile table | Use localStorage for MVP. Defer persistent profiles to future sprint. |
| Leaderboard needs aggregation queries | If DB adds profiles, create indexed query. Otherwise skip S66-05 for now. |
| Partner/follow system grows unmanaged | Limit to 100 partners per user initially. Add soft cap UI. |

---

## Dependencies & Blockers

- **No hard blockers.** All work is feature-additive.
- S66-05 (leaderboard) is optional; can defer if database schema isn't ready.
- S66-02 requires short-link generation (can use simple hash + localStorage initially).

---

## Test Strategy

- **Unit tests:** All stores + components
- **E2E smoke tests:** Follow a partner, share goal link, earn badge notification
- **Manual testing:** Privacy settings, link expiry, confetti on badge earn

---

## Success Metrics

- ✅ All S66-01 through S66-04 stories complete
- ✅ Unit test suite passes (>80% coverage for new code)
- ✅ E2E smoke tests pass
- ✅ Build verified (no new Svelte warnings)
- ✅ Share link shareable and accessible anonymously

---

## Notes

- **Story sizing:** S66-01, S66-03 are medium (3-5 hrs). S66-02, S66-04 are small (2-3 hrs). S66-05 is optional/bonus. S66-06 is continuous.
- **Tech stack:** Svelte 5 runes, SvelteKit, localStorage (or existing DB if available), no new dependencies needed.
- **Acceptance:** All stories must be done + unit tests passing before sprint closes.

---

## Next Steps (If Sprint 66 Approved)

1. Approve this plan
2. Run `bmad sprint 66 --auto` to create story files and begin S66-01 implementation
3. Developer takes lead on architecture + component wiring
4. Daily standups on progress
5. Commit & test daily

---

**Created:** 2026-03-25
**Planning Role:** PM
**Review:** Ready for dev team feedback or approval
