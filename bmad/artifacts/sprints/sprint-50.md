# Sprint 50 — Tech Debt + Feature Development

**Status:** Ready for gpt5-mini execution
**Tests Starting:** 702/713 passing (98.46%)
**Target:** 100% passing OR deploy S49 + prioritize features

---

## Stories (Prioritized)

### S50-01: Fix Search Engine Tests (5 failures)
**Files:** `src/lib/server/search.spec.ts`

**Failures:**
1. `should be case-insensitive` — returns 0 instead of 1
2. `should filter by single tag` — returns 1 instead of 2
3. `should filter by multiple tags (AND logic)` — returns 0 instead of 1
4. `should sort by date (descending)` — Cannot read docId (undefined)
5. `should combine search, filter, and sort` — returns 1 instead of 2

**Root Cause:** Search logic not handling indexed documents or filters correctly

**Fix Strategy:**
- Debug: `search('gatsby', indexed)` returns empty array
- Check: indexDocument() outputs correct titleLower/contentLower
- Fix: Verify calculateScore() finds matches in lowercased text
- Test: Case-insensitive matching works with .toLowerCase()

---

### S50-02: Fix RateLimit Algorithm (2 failures)
**Files:** `src/lib/server/rateLimit.spec.ts`

**Failures:**
1. `should allow requests within user limit` — token refill not working
2. `should respect IP limit even with different users` — IP limit too lenient

**Fix Strategy:**
- Review: Token bucket refill logic in `refillBucket()`
- Check: Bucket initialization with full tokens
- Verify: Token consumption logic decrements correctly
- Test: After 100 requests, request 101 returns false

---

### S50-03: Fix Browser Test Config (3 failures)
**Files:**
- `src/lib/elements/ConflictIndicator.spec.ts`
- `src/lib/elements/ExportButton.pdf.spec.ts`
- `src/lib/elements/SummaryPanel.spec.ts`

**Error:** `vitest/browser can be imported only inside the Browser Mode`

**Fix Strategy:**
- Check: vitest.config.ts browser test configuration
- Move: Browser tests to separate config or exclude from server pool
- Run: `npm run test:browser` or update test.include glob pattern

---

### S50-04: Fix Remaining Timeouts & Integration Issues (3 failures)
**Files:**
- `src/lib/sprint-21.spec.ts` (1 timeout)
- `src/routes/app/page.server.spec.ts` (1 mock mode)
- `src/lib/elements/DocumentList.svelte.spec.ts` (1 selector)

**Quick Fixes:**
1. **sprint-21 timeout:** Increase timeout to 10000ms
2. **page.server mock mode:** Ensure mock flag set in test setup
3. **DocumentList selector:** Use data-testid or aria-label instead of aria-current

---

### S50-05: Fix Streaming Accumulation (1 failure)
**Files:** `src/lib/suggestionStore.spec.ts`

**Failure:** `should accumulate streamed tokens` — empty string instead of "Hello"

**Fix Strategy:**
- Review: Mock ReadableStream implementation
- Check: TextEncoder mocking in test setup
- Fix: Ensure stream.read() returns data chunks correctly
- Verify: Accumulation loop processes all chunks

---

## Acceptance Criteria

- [ ] S50-01: All 5 search tests passing
- [ ] S50-02: Both rateLimit algorithm tests passing
- [ ] S50-03: Browser tests running in correct mode
- [ ] S50-04: All integration tests green
- [ ] S50-05: Streaming test accumulates data
- [ ] Total: 713/713 tests passing (100%)
- [ ] No regressions from S49
- [ ] Code deployed to main

---

## Quick Command Reference

```bash
# Run only failing tests
npm run test -- src/lib/server/search.spec.ts
npm run test -- src/lib/server/rateLimit.spec.ts

# Run browser tests (if needed)
npm run test:browser

# Full test suite
npm run test
```

---

## If Cannot Fix All (Fallback)
✅ Deploy S49 as-is (98.46% is production-ready)
📝 Document remaining 11 failures as known issues
🎯 Continue with new feature development

---

**Estimated Effort:** 2-4 hours
**Recommended:** Start with S50-01 (search), then S50-02 (rateLimit)
**Token Efficiency:** Minimal context needed per story
