# S69-06 — Unit Tests (Sprint 69 Coverage)

**Status:** 🟡 In Progress (1/4 complete)  
**Date:** 2026-03-27

## Goal

Provide comprehensive test coverage for all Sprint 69 features.

## Test Files Status

| File | Status | Tests | Notes |
|------|--------|-------|-------|
| `challengeStore.spec.ts` | ✅ Done | 11 tests | All passing |
| `discoveryQueries.spec.ts` | ❌ Missing | 0 tests | Needs implementation |
| `privacyStore.spec.ts` (update) | ❌ Missing | 0 tests | Add `showInDiscovery` tests |
| `challengeProgress.spec.ts` | ❌ Missing | 0 tests | Challenge wiring tests |

## Completed Tests

### challengeStore.spec.ts — 11 Tests ✅

```
✓ createChallenge (3)
  ✓ adds a challenge to available
  ✓ trims title to 80 chars
  ✓ sets endsAt based on durationDays
✓ join / leave (4)
  ✓ joins a challenge
  ✓ is idempotent — joining twice does not duplicate
  ✓ initializes progress on join
  ✓ leaves a challenge
✓ addWords (2)
  ✓ increments wordsContributed
  ✓ is a no-op if not joined
✓ getActive (1)
  ✓ returns only non-expired challenges
✓ reset (1)
  ✓ clears all state
```

**Result:** 11/11 passing ✅

## Tests to Implement

### discoveryQueries.spec.ts

**Coverage needed:**
- `submitDiscoveryProfile()` — adds/updates profile
- `listDiscoveryProfiles()` — returns sorted by streak
- `removeDiscoveryProfile()` — removes by userId
- `__resetDiscovery()` — clears store

**Example test structure:**
```typescript
describe('submitDiscoveryProfile', () => {
  it('adds a new profile', () => {
    submitDiscoveryProfile({
      userId: 'user1',
      displayName: '@writer1',
      currentStreak: 7,
      longestStreak: 14,
      totalWords: 5000,
      topBadgeIcon: '✍️',
      topBadgeName: 'Writer',
      submittedAt: new Date().toISOString()
    });
    const profiles = listDiscoveryProfiles();
    expect(profiles).toHaveLength(1);
  });

  it('updates existing profile', () => {
    // Submit twice, should update not duplicate
  });
});

describe('listDiscoveryProfiles', () => {
  it('sorts by currentStreak descending', () => {
    // Submit multiple, verify order
  });
});
```

### privacyStore.spec.ts (Update)

**Coverage needed:**
- `setShowInDiscovery(true/false)` — toggles opt-in
- `state.showInDiscovery` — reads current value
- Persistence to localStorage
- Default value is `false`

**Example test structure:**
```typescript
describe('showInDiscovery', () => {
  it('defaults to false', () => {
    expect(privacyStore.state.showInDiscovery).toBe(false);
  });

  it('sets showInDiscovery to true', () => {
    privacyStore.setShowInDiscovery(true);
    expect(privacyStore.state.showInDiscovery).toBe(true);
  });

  it('persists to localStorage', () => {
    // Set value, reload, verify persists
  });

  it('is separate from showOnLeaderboard', () => {
    // Set leaderboard false, discovery true, verify independent
  });
});
```

### challengeProgress.spec.ts (or writingGoalsStore.spec.ts update)

**Coverage needed:**
- Challenge progress wiring to `recordWords()`
- Milestone emission at 25%, 50%, 75%, 100%
- No duplicate milestone emissions
- Multiple challenges tracked independently

**Example test structure:**
```typescript
describe('challenge progress wiring', () => {
  it('adds words to joined challenges on recordWords', async () => {
    const challenge = challengeStore.createChallenge('Test', '', 10000, 30);
    challengeStore.join(challenge.id);
    
    goalsStore.recordWords(500);
    await new Promise(r => queueMicrotask(r));
    
    const progress = challengeStore.getProgress(challenge.id);
    expect(progress.wordsContributed).toBe(500);
  });

  it('emits challenge_progress at milestones', async () => {
    const challenge = challengeStore.createChallenge('Test', '', 10000, 30);
    challengeStore.join(challenge.id);
    
    // Write to 25%
    goalsStore.recordWords(2500);
    await new Promise(r => queueMicrotask(r));
    
    const events = activityStore.getByType('challenge_progress');
    expect(events.some(e => e.payload.milestone === 25)).toBe(true);
  });

  it('does not emit duplicate milestone events', async () => {
    // Write to 25%, then write more without crossing next milestone
    // Should not emit another 25% event
  });
});
```

## Acceptance Criteria

- [x] Tests for challengeStore (create, join, leave, progress, cap) — **11/11 passing**
- [ ] Tests for discoveryQueries (submit, list, remove) — **Missing**
- [ ] Tests for privacyStore discovery toggle — **Missing**
- [ ] Tests for challenge progress wiring — **Missing**
- [ ] 80%+ coverage for new code — **~25% current**

## Files to Create

- `src/lib/server/discoveryQueries.spec.ts`
- `src/lib/privacyStore.spec.ts` (update with `showInDiscovery` tests)
- `src/lib/challengeProgress.spec.ts` OR update `writingGoalsStore.spec.ts`

## Related Stories

- S69-01: Writer Discovery Page
- S69-02: Submit Profile to Discovery
- S69-03: Community Writing Challenge Store
- S69-05: Wire Challenge Progress to Writing Activity

## Testing Notes

**Mock Setup Required:**
```typescript
global.localStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as any;
```

**Test Isolation:**
- Reset stores between tests
- Clear localStorage mocks
- Use fake timers for deadline reminder tests
