# Sprint 69 Planning — Writer Discovery & Community Challenges

**Status:** Planning
**Target Date:** 2026-03-28
**Planned Stories:** 6
**Estimated Effort:** 5 days

---

## Sprint Goal

Help writers find accountability partners and participate in shared writing challenges.
Currently, the only way to follow someone is by navigating directly to their profile URL —
there's no way to discover writers or join a community writing event.

---

## Context

**Foundation built in S66–S68:**
- ✅ User profiles + goal stats
- ✅ Follow/unfollow accountability partners
- ✅ Activity feed (see partner wins)
- ✅ Leaderboards (weekly + all-time)

**Gap:** You can follow people — but how do you find them?
And once you're in a community, how do you write *together* toward a shared goal?

---

## Stories

### S69-01: Writer Discovery Page
**Acceptance Criteria:**
- Route `/discover` showing public profiles opted into discovery
- Grid of writer cards: avatar emoji, @username, current streak, badges earned
- Search by username (client-side filter)
- Privacy-aware: only shows users with `showOnLeaderboard: true`
- Follow button directly on each card
- Empty state if no writers have opted in
- Unit tests

**Why:** Without discovery, social features stay siloed. Writers need a way to find each other.

**Files to Create:**
- `src/routes/discover/+page.svelte`
- `src/routes/api/discover/+server.ts`
- `src/lib/elements/WriterCard.svelte`
- `src/lib/server/discoveryQueries.ts`
- Tests

---

### S69-02: Submit Profile to Discovery
**Acceptance Criteria:**
- `privacyStore` gains `showInDiscovery` toggle (separate from leaderboard)
- When ON: profile submitted to in-memory discovery store on page load
- Profile card shows: username, streak, word count, top badge
- Settings UI toggle: "Allow others to discover me"
- Unit tests

**Why:** Discovery requires opt-in. Separate from leaderboard visibility — writers may want one but not the other.

**Files to Create/Modify:**
- Update `src/lib/privacyStore.svelte.ts` (add `showInDiscovery`)
- `src/lib/server/discoveryQueries.ts`
- Settings UI update
- Tests

---

### S69-03: Community Writing Challenge Store
**Acceptance Criteria:**
- Challenge model: `{ id, title, goal (words), startDate, endDate, participants[] }`
- Create challenge (title, word goal, duration: 3/7/14/30 days)
- Join/leave challenge
- Track personal contribution (words written during challenge period)
- Max 5 active challenges per user
- Persisted to localStorage
- Unit tests

**Why:** Group writing sprints drive engagement spikes and community bonding.

**Files to Create:**
- `src/lib/challengeStore.svelte.ts`
- Tests

---

### S69-04: Challenge UI (Create & Join)
**Acceptance Criteria:**
- `/challenges` page with:
  - "Active challenges" section (joined ones)
  - "Discover challenges" section (public ones)
  - "Create challenge" button → modal
- `CreateChallengeModal.svelte` with form: title, word goal, duration
- `ChallengeCard.svelte` showing progress bar, participant count, days left
- Join/leave button on each card
- Unit tests

**Why:** Challenges need a UI to be useful. Cards should surface urgency (days left) and momentum (participant count).

**Files to Create:**
- `src/routes/challenges/+page.svelte`
- `src/lib/elements/ChallengeCard.svelte`
- `src/lib/elements/CreateChallengeModal.svelte`
- Tests

---

### S69-05: Wire Challenge Progress to Writing Activity
**Acceptance Criteria:**
- When user writes (goalsStore.recordWords), update active challenge contributions
- Challenge progress = words written since challenge start date
- Emit `challenge_progress` activity event when 25%, 50%, 75%, 100% milestones hit
- `ChallengeCard` shows live progress bar
- Unit tests

**Why:** Challenges that don't track progress automatically feel broken. Auto-tracking removes friction.

**Files to Modify:**
- `src/lib/writingGoalsStore.svelte.ts` (hook challenge update)
- `src/lib/challengeStore.svelte.ts` (progress calculation)
- `src/lib/activityStore.svelte.ts` (add `challenge_progress` type)
- Tests

---

### S69-06: Unit Tests (Sprint Coverage)
**Acceptance Criteria:**
- Tests for discoveryQueries (submit, list, privacy filter)
- Tests for challengeStore (create, join, leave, progress, cap)
- Tests for challenge progress wiring
- Tests for privacyStore discovery toggle
- 80%+ coverage for new code

**Files to Create:**
- `src/lib/server/discoveryQueries.spec.ts`
- `src/lib/challengeStore.spec.ts`
- `src/lib/challengeProgress.spec.ts`

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Discovery store has no real users (all local) | Seed with current user; show "Be the first" empty state |
| Challenges need server-side coordination | MVP: client-side store + share by link; server sync in future sprint |
| Progress tracking needs accurate word count | Use goalsStore.todayWords; record delta per day during challenge |
| Too many active challenges clutters UI | Cap at 5 active challenges per user |

---

## Dependencies

- Relies on `privacyStore` (S67-04) — ✅ done
- Relies on `activityStore` (S68-01) — ✅ done
- Relies on `goalsStore` (existing) — ✅ done
- Relies on `partnersStore` (S66-03) — ✅ done

---

## Success Metrics

- ✅ `/discover` shows public writer profiles
- ✅ `/challenges` lists active + discoverable challenges
- ✅ Challenge progress auto-tracks from writing activity
- ✅ Activity events emitted at challenge milestones
- ✅ Unit tests passing (>80% new coverage)

---

**Created:** 2026-03-26
**Planning Role:** PM
**Review:** Ready for dev
