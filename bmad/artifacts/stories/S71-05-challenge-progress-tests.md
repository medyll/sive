# S71-05 — Integration Tests: Challenge Progress Wiring

**Status:** 🟡 Todo  
**Priority:** Medium  
**Estimate:** 1-2 hours

---

## Problem

S69-05 challenge progress wiring was implemented and manually tested, but lacks automated integration tests.

**Implementation (S69-05):**
- `writingGoalsStore.recordWords()` contributes to joined challenges
- Milestone events emitted at 25%, 50%, 75%, 100%
- `challenge_progress` activity type added

---

## Goal

Add integration tests verifying challenge progress tracking and milestone emissions.

---

## Acceptance Criteria

- [ ] Test: Writing words updates challenge progress
- [ ] Test: Milestone events emitted at 25/50/75/100%
- [ ] Test: No duplicate milestone events
- [ ] Test: Multiple challenges tracked independently
- [ ] All tests passing

---

## Implementation

### File to Create

`src/lib/challengeProgress.spec.ts`

### Test Setup

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { challengeStore } from './challengeStore.svelte';
import { goalsStore } from './writingGoalsStore.svelte';
import { activityStore } from './activityStore.svelte';

global.localStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as any;

beforeEach(() => {
  challengeStore.reset();
  goalsStore.reset();
  activityStore.reset();
});
```

---

## Test Cases

### 1. Writing words updates challenge progress

```typescript
it('adds words to joined challenges on recordWords', async () => {
  const challenge = challengeStore.createChallenge(
    'Test Challenge',
    'Test description',
    10000, // targetWords
    30     // durationDays
  );
  challengeStore.join(challenge.id);
  
  goalsStore.recordWords(500);
  await new Promise(r => queueMicrotask(r));
  
  const progress = challengeStore.getProgress(challenge.id);
  expect(progress.wordsContributed).toBe(500);
});
```

### 2. Milestone emission at 25%

```typescript
it('emits challenge_progress at 25% milestone', async () => {
  const challenge = challengeStore.createChallenge(
    'Test Challenge',
    '',
    10000,
    30
  );
  challengeStore.join(challenge.id);
  
  goalsStore.recordWords(2500); // 25%
  await new Promise(r => queueMicrotask(r));
  
  const events = activityStore.getByType('challenge_progress');
  expect(events.some(e => e.payload.milestone === 25)).toBe(true);
  expect(events.some(e => 
    e.payload.challengeId === challenge.id &&
    e.payload.wordsContributed === 2500
  )).toBe(true);
});
```

### 3. Milestone emission at 50%, 75%, 100%

```typescript
it('emits challenge_progress at all milestones', async () => {
  const challenge = challengeStore.createChallenge('Test', '', 10000, 30);
  challengeStore.join(challenge.id);
  
  goalsStore.recordWords(2500); // 25%
  await new Promise(r => queueMicrotask(r));
  
  goalsStore.recordWords(5000); // 50%
  await new Promise(r => queueMicrotask(r));
  
  goalsStore.recordWords(7500); // 75%
  await new Promise(r => queueMicrotask(r));
  
  goalsStore.recordWords(10000); // 100%
  await new Promise(r => queueMicrotask(r));
  
  const events = activityStore.getByType('challenge_progress');
  const milestones = events.map(e => e.payload.milestone);
  
  expect(milestones).toContain(25);
  expect(milestones).toContain(50);
  expect(milestones).toContain(75);
  expect(milestones).toContain(100);
});
```

### 4. No duplicate milestone events

```typescript
it('does not emit duplicate milestone events', async () => {
  const challenge = challengeStore.createChallenge('Test', '', 10000, 30);
  challengeStore.join(challenge.id);
  
  // Write to 25%
  goalsStore.recordWords(2500);
  await new Promise(r => queueMicrotask(r));
  
  // Write more without crossing next milestone
  goalsStore.recordWords(3000); // Still in 25-50% range
  await new Promise(r => queueMicrotask(r));
  
  const events = activityStore.getByType('challenge_progress');
  const milestone25Events = events.filter(e => e.payload.milestone === 25);
  
  expect(milestone25Events).toHaveLength(1); // Only one 25% event
});
```

### 5. Multiple challenges tracked independently

```typescript
it('tracks multiple challenges independently', async () => {
  const challenge1 = challengeStore.createChallenge('Test 1', '', 10000, 30);
  const challenge2 = challengeStore.createChallenge('Test 2', '', 5000, 30);
  
  challengeStore.join(challenge1.id);
  challengeStore.join(challenge2.id);
  
  goalsStore.recordWords(2500);
  await new Promise(r => queueMicrotask(r));
  
  const progress1 = challengeStore.getProgress(challenge1.id);
  const progress2 = challengeStore.getProgress(challenge2.id);
  
  expect(progress1.wordsContributed).toBe(2500);
  expect(progress2.wordsContributed).toBe(2500);
  
  // challenge1 is at 25%, challenge2 is at 50%
  const events = activityStore.getByType('challenge_progress');
  const challenge1Events = events.filter(e => e.payload.challengeId === challenge1.id);
  const challenge2Events = events.filter(e => e.payload.challengeId === challenge2.id);
  
  expect(challenge1Events.some(e => e.payload.milestone === 25)).toBe(true);
  expect(challenge2Events.some(e => e.payload.milestone === 25)).toBe(true);
  expect(challenge2Events.some(e => e.payload.milestone === 50)).toBe(true);
});
```

### 6. Non-joined challenges not updated

```typescript
it('does not update non-joined challenges', async () => {
  const challenge = challengeStore.createChallenge('Test', '', 10000, 30);
  // Don't join
  
  goalsStore.recordWords(500);
  await new Promise(r => queueMicrotask(r));
  
  const progress = challengeStore.getProgress(challenge.id);
  expect(progress).toBe(null); // Not joined, no progress
});
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/challengeProgress.spec.ts` | Integration tests for challenge wiring |

---

## Related Stories

- S69-05: Wire Challenge Progress (implementation)
- S69-03: Community Writing Challenge Store
- S71-06: Update Test Documentation (test patterns)

---

## Definition of Done

- [ ] All 6 test cases implemented
- [ ] All tests passing
- [ ] Tests use queueMicrotask pattern
- [ ] Tests documented in sprint summary
