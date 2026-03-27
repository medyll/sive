# Sprint 71 Planning — Test Hardening & Quality

**Status:** Planning  
**Target Date:** 2026-03-28  
**Planned Stories:** 6  
**Estimated Effort:** 1-2 days

---

## Sprint Goal

Eliminate technical debt in the test suite to enable confident refactoring and faster future development. Fix placeholder tests, E2E timeout issues, and Svelte build warnings.

---

## Context

**Current State:**
- 52 failing tests (mostly placeholder `expect(typeof Object).toBe('object')` assertions)
- 1 critical failure: `page.svelte.spec.ts` — missing mock data
- E2E tests blocked by webServer timeout (120s)
- Svelte build warnings (a11y/state/css) deferred since S25

**Why Now:**
- S69 & S70 completed with strong momentum
- Test debt accumulating — blocks confident refactors
- E2E reliability issues slow down PR validation
- Clean test suite = faster future sprints

---

## Stories

### S71-01: Fix Placeholder Tests — Component Specs

**Problem:** 6 component spec files use `expect(typeof Object).toBe('object')` placeholder assertions.

**Files to Fix:**
| File | Failing Tests | Component |
|------|---------------|-----------|
| `BadgeDisplay.spec.ts` | 9 | Badge display grid + progress |
| `UserProfileCard.spec.ts` | 8 | User profile card with stats |
| `ShareGoalsModal.spec.ts` | 5 | Share goals modal |
| `WeeklyHistoryPanel.spec.ts` | 6 | Weekly history visualization |

**Acceptance Criteria:**
- [ ] Replace all placeholder assertions with real tests
- [ ] Test component rendering with props
- [ ] Test user interactions (clicks, hovers)
- [ ] Test derived state updates
- [ ] Test store integrations (mocked)
- [ ] All tests passing (28 tests total)

**Files to Create/Modify:**
- `src/lib/elements/BadgeDisplay.spec.ts` — Rewrite
- `src/lib/elements/UserProfileCard.spec.ts` — Rewrite
- `src/lib/elements/ShareGoalsModal.spec.ts` — Rewrite
- `src/lib/elements/WeeklyHistoryPanel.spec.ts` — Rewrite

**Estimated Time:** 4-6 hours

---

### S71-02: Fix Critical Test — page.svelte.spec.ts

**Problem:** `page.svelte.spec.ts` fails with `Cannot read properties of undefined (reading 'documents')`

**Root Cause:** Test renders `+page.svelte` without providing required `data` prop (documents, activeDocumentId).

**Acceptance Criteria:**
- [ ] Add mock data for `data.documents` and `data.activeDocumentId`
- [ ] Test renders without crashing
- [ ] Test document switching
- [ ] Test editor panel mounting
- [ ] All tests passing

**Files to Modify:**
- `src/routes/page.svelte.spec.ts` — Add mock data, fix test

**Example Fix:**
```typescript
import { render } from '@testing-library/svelte';
import Page from './+page.svelte';

it('should render h1', () => {
  const { getByText } = render(Page, {
    data: {
      documents: [{ id: '1', title: 'Test Doc', content: '' }],
      activeDocumentId: '1'
    }
  });
  expect(getByText('Test Doc')).toBeInTheDocument();
});
```

**Estimated Time:** 30-60 minutes

---

### S71-03: Fix E2E WebServer Timeout

**Problem:** Playwright E2E tests fail with webServer timeout (120s) when running `npm run build && npm run preview`.

**Root Cause:** Build takes >120s on slower machines, or preview server doesn't start in time.

**Solutions (choose one):**

**Option A: Increase timeout (quick fix)**
```typescript
// playwright.config.ts
webServer: {
  command: 'npm run build && npm run preview',
  port: 4173,
  timeout: 300000, // 5 minutes
  // ...
}
```

**Option B: Start preview manually (recommended)**
```typescript
// playwright.config.ts
webServer: process.env.PW_SKIP_WEB_SERVER === '1' 
  ? undefined 
  : { 
      command: 'npm run build && npm run preview', 
      port: 4173, 
      timeout: 180000 
    }
```

Then in CI/locally:
```bash
# Terminal 1: Start preview
npm run build && npm run preview &

# Terminal 2: Run E2E
PW_SKIP_WEB_SERVER=1 npm run test:e2e
```

**Acceptance Criteria:**
- [ ] E2E tests run without timeout
- [ ] Documentation updated in README.md
- [ ] CI config updated if needed

**Files to Modify:**
- `playwright.config.ts` — Update timeout or add skip option
- `README.md` — Document manual preview start

**Estimated Time:** 30 minutes

---

### S71-04: Fix Svelte Build Warnings

**Problem:** Svelte compiler warnings deferred since S25:
- `a11y_*` — Accessibility warnings (missing aria-labels, roles)
- `state_*` — State reference issues (reactivity)
- `css_*` — Unused CSS selectors

**Deferred Issues (from del-2026-03-25-001):**
- Non-blocking Svelte warnings
- LightningCSS at-rule errors

**Acceptance Criteria:**
- [ ] Audit all Svelte warnings (`npm run build` output)
- [ ] Fix critical a11y warnings (missing labels on interactive elements)
- [ ] Fix state reference warnings (reactivity issues)
- [ ] Remove unused CSS
- [ ] Build completes with 0 warnings (or document remaining)

**Approach:**
1. Run `npm run build` and capture warnings
2. Categorize by severity (a11y > state > css)
3. Fix high-priority warnings first
4. Document any deferred warnings with justification

**Files to Modify:** TBD (based on build output)

**Estimated Time:** 2-4 hours

---

### S71-05: Add Integration Tests — Challenge Progress Wiring

**Problem:** S69-05 challenge progress wiring tested manually, no automated integration test.

**Acceptance Criteria:**
- [ ] Test: Writing words updates challenge progress
- [ ] Test: Milestone events emitted at 25/50/75/100%
- [ ] Test: No duplicate milestone events
- [ ] Test: Multiple challenges tracked independently
- [ ] All tests passing

**Files to Create:**
- `src/lib/challengeProgress.spec.ts` — Integration tests

**Example Test:**
```typescript
describe('challenge progress wiring', () => {
  it('adds words to joined challenges on recordWords', async () => {
    const challenge = challengeStore.createChallenge('Test', '', 10000, 30);
    challengeStore.join(challenge.id);
    
    goalsStore.recordWords(2500);
    await new Promise(r => queueMicrotask(r));
    
    const progress = challengeStore.getProgress(challenge.id);
    expect(progress.wordsContributed).toBe(2500);
  });

  it('emits challenge_progress at 25% milestone', async () => {
    const challenge = challengeStore.createChallenge('Test', '', 10000, 30);
    challengeStore.join(challenge.id);
    
    goalsStore.recordWords(2500); // 25%
    await new Promise(r => queueMicrotask(r));
    
    const events = activityStore.getByType('challenge_progress');
    expect(events.some(e => e.payload.milestone === 25)).toBe(true);
  });
});
```

**Estimated Time:** 1-2 hours

---

### S71-06: Update Test Documentation

**Problem:** Test patterns and conventions not documented.

**Acceptance Criteria:**
- [ ] Create `bmad/artifacts/tests/test-patterns.md`
- [ ] Document: Mock setup, store reset patterns, async testing
- [ ] Document: Component testing conventions
- [ ] Document: E2E test structure
- [ ] Link from `bmad/artifacts/tests/README.md`

**Files to Create:**
- `bmad/artifacts/tests/test-patterns.md`

**Estimated Time:** 1 hour

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Placeholder tests reveal real bugs | Fix bugs, document in changelog, add regression tests |
| Svelte warnings require major refactors | Defer non-critical, fix a11y only |
| E2E timeout persists with manual start | Increase timeout to 5min, investigate build slowness |
| Integration tests flaky | Use queueMicrotask pattern, add retry logic |

---

## Dependencies

- ✅ S69 complete — Challenge wiring exists
- ✅ S70 complete — Notification system stable
- ✅ Test infrastructure — Vitest, Playwright configured

---

## Success Metrics

- ✅ 100+ tests passing (currently ~1,048 → target ~1,100)
- ✅ 0 critical test failures
- ✅ E2E tests run without timeout
- ✅ Build completes with 0 warnings (or documented exceptions)
- ✅ Test patterns documented

---

## Test Coverage Targets

| Category | Current | Target |
|----------|---------|--------|
| Unit Tests | 1,048 | 1,100+ |
| Component Tests | 28 failing | 0 failing |
| E2E Tests | Timeout issues | Stable |
| Build Warnings | ~10 | 0 (or documented) |

---

## Sprint History

- **S69:** Writer Discovery & Community Challenges ✅
- **S70:** Notifications & Writing Reminders ✅
- **S71:** Test Hardening & Quality (THIS SPRINT)

---

**Created:** 2026-03-27  
**Planning Role:** PM  
**Review:** Ready for dev
