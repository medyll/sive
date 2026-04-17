# Sprint 76 Planning — E2E Test Hardening

**Status:** Planning  
**Target Date:** 2026-03-30  
**Planned Stories:** 5  
**Estimated Effort:** 2-3 days

---

## Sprint Goal

Comprehensive E2E test coverage for features implemented in S69-S74 (challenges, AI features, server-side sync) with improved test reliability and performance.

---

## Context

**Current E2E Coverage:**
- ✅ Auth flow (S18)
- ✅ Document persistence (S8)
- ✅ Suggestions & AI chat (S10)
- ✅ Coherence & Style tabs (S6, S7)
- ✅ Mobile UI (S75)

**Coverage Gaps:**
- ❌ Challenge features (S69)
- ❌ AI features expansion (S73)
- ❌ Server-side sync (S74)
- ❌ Ghost text & inline completions
- ❌ Selection toolbar & rewrite actions

**Known Issues:**
- Flaky parallel tests (S50-03)
- WebServer timeout (del-2026-03-25-002)
- Some tests leak window globals

---

## Stories

### S76-01: E2E Tests for Challenge Features

**Goal:** Full E2E coverage for challenge CRUD and participation.

**Acceptance Criteria:**
- [ ] Test: Create challenge from /challenges page
- [ ] Test: Join challenge from card
- [ ] Test: Leave challenge
- [ ] Test: Challenge progress updates on write
- [ ] Test: Challenge deadline notification
- [ ] Test: Challenge list filtering (active/joined tabs)

**Files to Create:**
- `e2e/challenge-features.spec.ts`

**Estimated Time:** 3-4 hours

---

### S76-02: E2E Tests for AI Features

**Goal:** Full E2E coverage for AI features (ghost text, toolbar, outline).

**Acceptance Criteria:**
- [ ] Test: Ghost text appears after typing pause
- [ ] Test: Tab accepts ghost text
- [ ] Test: Escape dismisses ghost text
- [ ] Test: Selection toolbar appears on text selection
- [ ] Test: Rewrite action modifies selection
- [ ] Test: Outline generator creates structure
- [ ] Test: Outline insert at cursor

**Files to Create:**
- `e2e/ai-features.spec.ts`

**Estimated Time:** 4-5 hours

---

### S76-03: E2E Tests for Server-Side Sync

**Goal:** Verify database-backed persistence for challenges, discovery, activity.

**Acceptance Criteria:**
- [ ] Test: Challenge persists across page refresh
- [ ] Test: Challenge progress syncs to database
- [ ] Test: Discovery profile opt-in persists
- [ ] Test: Activity events load from database
- [ ] Test: Multi-tab sync (challenge progress)

**Files to Create:**
- `e2e/server-sync.spec.ts`

**Estimated Time:** 3-4 hours

---

### S76-04: Fix Flaky Parallel Tests

**Goal:** Eliminate flaky tests that fail intermittently in parallel runs.

**Acceptance Criteria:**
- [ ] Identify all flaky tests (check CI history)
- [ ] Fix window global leakage
- [ ] Fix localStorage isolation issues
- [ ] Fix async timing issues
- [ ] Mark remaining flaky tests with proper retries

**Files to Modify:**
- Various test files based on findings

**Estimated Time:** 3-4 hours

---

### S76-05: E2E Performance Improvements

**Goal:** Reduce E2E test suite execution time.

**Acceptance Criteria:**
- [ ] Parallel test execution working reliably
- [ ] Test suite completes in <10 minutes
- [ ] WebServer timeout increased or manual start documented
- [ ] Test isolation prevents cross-test contamination
- [ ] CI pipeline optimized

**Files to Modify:**
- `playwright.config.ts`
- `e2e/global-setup.ts`
- CI configuration

**Estimated Time:** 2-3 hours

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| API endpoints not ready for E2E | Use mock data, skip API-dependent tests |
| Database state leaks between tests | Reset DB in global teardown |
| Tests too slow | Parallel execution, selective test runs |
| Flaky tests block CI | Retry logic, quarantine flaky tests |

---

## Dependencies

- ✅ S69: Challenge features (stable)
- ✅ S73: AI features (stable)
- ✅ S74: Server-side sync (stable)
- ✅ S75: Mobile E2E tests (pattern reference)

---

## Success Metrics

- ✅ 20+ new E2E tests for S69-S74 features
- ✅ 0 flaky tests in CI
- ✅ Test suite completes in <10 minutes
- ✅ 90%+ E2E test pass rate
- ✅ WebServer timeout resolved

---

## Recommendation

**Proceed with E2E Test Hardening (S76)** because:
1. Critical for production confidence
2. Prevents regressions in new features
3. Improves CI reliability
4. Enables faster future development

---

**Created:** 2026-03-29  
**Planning Role:** PM  
**Review:** Ready for dev
