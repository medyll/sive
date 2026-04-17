# Sprint 72 Planning — Component Test Infrastructure

**Status:** Planning  
**Target Date:** 2026-03-28  
**Planned Stories:** 5  
**Estimated Effort:** 1-2 days

---

## Sprint Goal

Fix the component test infrastructure issues discovered in S71 to enable reliable testing of components with Svelte 5 runes and store integrations.

---

## Context

**Problem Discovered in S71:**

Components with heavy store integrations fail in browser test mode:
- `page.container` is undefined
- Tests timeout during execution
- Affects: BadgeDisplay, UserProfileCard, ShareGoalsModal, WeeklyHistoryPanel

**Root Cause Analysis:**
- vitest-browser-svelte may not fully support Svelte 5 runes reactivity
- Store subscriptions ($state, $derived) may not initialize properly in test environment
- Component mounting may fail silently when stores have complex initialization

**Current Workarounds:**
- Server-side unit tests work reliably
- Simple components without store integrations test fine
- Components with only props (no stores) work correctly

---

## Stories

### S72-01: Investigate Test Infrastructure Root Cause

**Goal:** Identify exact cause of component test failures.

**Acceptance Criteria:**
- [ ] Document exact error messages and stack traces
- [ ] Test with minimal reproduction case
- [ ] Check vitest-browser-svelte version compatibility
- [ ] Check Svelte 5 runes compatibility documentation
- [ ] Create minimal failing test case repo (if needed)
- [ ] Document findings in `bmad/docs/test-infrastructure-issue.md`

**Files to Create:**
- `bmad/docs/test-infrastructure-issue.md` — Root cause analysis

**Estimated Time:** 2-3 hours

---

### S72-02: Fix vitest Configuration for Svelte 5 Runes

**Goal:** Update vitest/vite config to properly support Svelte 5 runes in tests.

**Acceptance Criteria:**
- [ ] Review vite.config.ts test configuration
- [ ] Check svelte-preprocessor settings for tests
- [ ] Verify vitest-browser-svelte setup
- [ ] Test with simple component first
- [ ] Document working configuration

**Files to Modify:**
- `vite.config.ts` — Test configuration
- `svelte.config.js` — Preprocessor settings (if needed)

**Estimated Time:** 2-4 hours

---

### S72-03: Create Store Mocking Utilities for Tests

**Goal:** Create reusable utilities for mocking stores in component tests.

**Acceptance Criteria:**
- [ ] Create `src/lib/test/mocks.ts` with store mocking helpers
- [ ] Mock utilities for: badgesStore, goalsStore, streakStore, userProfileStore
- [ ] Document mocking patterns
- [ ] Test with simple component

**Files to Create:**
- `src/lib/test/mocks.ts` — Store mocking utilities
- `src/lib/test/README.md` — Mocking documentation

**Estimated Time:** 2-3 hours

---

### S72-04: Rewrite BadgeDisplay Tests with Fixed Infrastructure

**Goal:** Successfully test BadgeDisplay component with fixed infrastructure.

**Acceptance Criteria:**
- [ ] BadgeDisplay.svelte.spec.ts passes all tests
- [ ] Tests cover: earned badges, progress display, store integration
- [ ] Tests use proper mocking utilities
- [ ] Tests complete without timeout

**Files to Modify:**
- `src/lib/elements/BadgeDisplay.svelte.spec.ts` — Rewrite with fixes

**Estimated Time:** 2-3 hours

---

### S72-05: Rewrite UserProfileCard Tests with Fixed Infrastructure

**Goal:** Successfully test UserProfileCard component with fixed infrastructure.

**Acceptance Criteria:**
- [ ] UserProfileCard.svelte.spec.ts passes all tests
- [ ] Tests cover: profile display, stats, edit mode, store integration
- [ ] Tests use proper mocking utilities
- [ ] Tests complete without timeout

**Files to Modify:**
- `src/lib/elements/UserProfileCard.svelte.spec.ts` — Rewrite with fixes

**Estimated Time:** 2-3 hours

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Root cause is upstream (vitest-browser-svelte bug) | File issue upstream, document workaround, use server-side tests temporarily |
| Fix requires major config changes | Document changes, update all test files consistently |
| Some components still fail after fix | Accept limitation, use integration/E2E tests instead |
| Time overrun on investigation | Time-box investigation to 4 hours, escalate if no progress |

---

## Dependencies

- ✅ S69: Challenge progress wiring (for S72-05)
- ✅ S70: Notification system (stable)
- ✅ S71: Test documentation (patterns documented)

---

## Success Metrics

- ✅ Root cause documented
- ✅ vitest config updated for Svelte 5 runes
- ✅ Store mocking utilities created
- ✅ BadgeDisplay tests pass (10+ tests)
- ✅ UserProfileCard tests pass (10+ tests)
- ✅ Test infrastructure documented for future sprints

---

## Alternative: Feature Sprint

If test infrastructure proves too complex, consider pivoting to:

### Sprint 72B — AI Features Expansion

**Stories:**
- S72B-01: Ghost Text Improvements (Tab acceptance, partial accept)
- S72B-02: AI Rewrite Tools (Selection toolbar, tone submenu)
- S72B-03: Outline Generator (AI outline endpoint, OutlinePanel)
- S72B-04: Writing Stats Panel (Readability metrics, footer display)

---

## Recommendation

**Proceed with Test Infrastructure Sprint (S72)** because:
1. Unblocks all future component testing
2. Improves code quality and refactoring confidence
3. One-time investment with long-term benefits
4. Can pivot to features if blocked >4 hours

---

**Created:** 2026-03-27  
**Planning Role:** PM  
**Review:** Ready for dev
