# Sprint 49 — Test Hardening & Quality Stabilization

**Sprint Duration:** 2026-03-19 → 2026-03-26
**Goal:** Fix 28 failing tests + stabilize testing patterns
**Success Metric:** 100% test passing (713/713) + documented test patterns

---

## Sprint Backlog

### S49-01: Fix Server-Side Test Environment Issues (2 stories)

**Issue Group:** `rateLimit.spec.ts`, `rateLimitMiddleware.spec.ts`, `search.spec.ts`
**Root Cause:** Missing mock implementations for server-side APIs (Date.now, crypto, regex)
**Approach:**
- Add vi.mock() for global Date, crypto modules in beforeEach
- Implement proper setup/teardown for per-test isolation
- Mock getClientAddress() SvelteKit utility
- Add request/response mocking for middleware tests

**Files:**
- `src/lib/server/rateLimit.spec.ts` (4 failures)
- `src/lib/server/rateLimitMiddleware.spec.ts` (6 failures)
- `src/lib/server/search.spec.ts` (6 failures)

**Expected Outcome:** 16 tests fixed ✓

---

### S49-02: Fix API Streaming Tests (2 stories)

**Issue Group:** `stream.spec.ts`, `suggestionStore.spec.ts`, `ExportButton.pdf.spec.ts`
**Root Cause:** SSE/streaming mocks not properly implementing ReadableStream API
**Approach:**
- Fix streaming accumulation test — use proper TextEncoder/TextDecoder mocks
- Implement complete mock ReadableStream with getReader() + read() loop
- Add proper content-type headers in response mocks
- Test malformed base64 handling separately from stream logic

**Files:**
- `src/routes/api/ai/stream/stream.spec.ts` (5 failures)
- `src/lib/suggestionStore.spec.ts` (1 failure)
- `src/lib/elements/ExportButton.pdf.spec.ts` (1 failure)

**Expected Outcome:** 7 tests fixed ✓

---

### S49-03: Fix Component Rendering Tests (2 stories)

**Issue Group:** `ConflictIndicator.spec.ts`, `SummaryPanel.spec.ts`, `DocumentList.svelte.spec.ts`
**Root Cause:** Browser-specific rendering delays, aria-current selector issues
**Approach:**
- Fix aria-current selector — use data-testid or explicit selector
- Mock Svelte component lifecycle timing (onMount delays)
- Add explicit waitFor() for DOM mutation assertions
- Document timeout requirements for chromium browser tests

**Files:**
- `src/lib/elements/ConflictIndicator.spec.ts` (3 failures)
- `src/lib/elements/SummaryPanel.spec.ts` (1 failure)
- `src/lib/elements/DocumentList.svelte.spec.ts` (1 failure)

**Expected Outcome:** 5 tests fixed ✓

---

### S49-04: Fix Document Handler Tests (1 story)

**Issue Group:** `page.server.spec.ts`
**Root Cause:** Mock mode logic not properly isolated from database calls
**Approach:**
- Verify mock mode flag is properly set in test context
- Mock db.document.update() call
- Add error handling for undefined responses

**Files:**
- `src/routes/app/page.server.spec.ts` (1 failure)

**Expected Outcome:** 1 test fixed ✓

---

### S49-05: Fix PDF Sanitization Tests (1 story)

**Issue Group:** `pdf.spec.ts`
**Root Cause:** Unicode character removal not properly mocked
**Approach:**
- Verify regex sanitization matches expected output
- Add test case with mixed unicode + ASCII
- Document sanitization behavior

**Files:**
- `src/routes/api/export/pdf/pdf.spec.ts` (1 failure)

**Expected Outcome:** 1 test fixed ✓

---

### S49-06: Document Test Patterns & Patterns Library (1 story)

**Deliverable:** `bmad/artifacts/docs/test-patterns.md`
**Content:**
- ✅ Environment checks (typeof window, typeof localStorage)
- ✅ Mock patterns (vi.spyOn + mockImplementation vs mockReturnValue)
- ✅ SSE/streaming mocks (ReadableStream, TextEncoder)
- ✅ Component timing (waitFor, onMount delays)
- ✅ Server API mocks (getClientAddress, Date.now)
- ✅ Test isolation patterns (beforeEach/afterEach cleanup)

**Audience:** Future developers fixing tests in this codebase

**Expected Outcome:** Reusable reference for test improvements

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 28 failing tests → passing | ❌ Pending |
| Zero new test regressions | ✓ Baseline: 685 passing |
| Test patterns doc published | ❌ Pending |
| Code review checklist signed off | ❌ Pending |
| bmad/status.yaml updated | ❌ Pending |

---

## Risk Assessment

**High Risk:**
- Streaming tests require deep understanding of ReadableStream API — may need 2-3 attempts
- Browser timing tests (chromium) may have race conditions requiring setTimeout debugging

**Medium Risk:**
- Mock implementations for global APIs (Date, crypto) may conflict with other test suites
- Server-side test isolation may require vi.resetModules() calls

**Mitigation:**
- Run full test suite after each story to catch regressions
- Document mock setup for cross-team reference
- Use isolated test contexts (describe.only, test.only) during debugging

---

## Dependencies & Blockers

- ✅ Code merged to main (S48 complete)
- ✅ Test baseline established (685/713 passing)
- ⚠️ No known blockers — proceed autonomously

---

## Next Actions (Post-Sprint)

1. **Sprint 50:** Feature development (new AI capabilities, UI polish)
2. **Deployment:** Once S49 complete → push to staging/production
3. **Post-Release:** Gather user feedback on presence features, onboarding tour

---

**Sprint Owner:** Scrum Master
**Created:** 2026-03-19
**Updated:** 2026-03-19
