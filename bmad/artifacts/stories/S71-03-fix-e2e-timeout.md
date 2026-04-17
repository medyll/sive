# S71-03 — Fix E2E WebServer Timeout

**Status:** 🟡 Todo  
**Priority:** High (Blocking E2E)  
**Estimate:** 30 minutes

---

## Problem

Playwright E2E tests fail with:

```
Error: Web server timeout (120000ms)
Command: npm run build && npm run preview
```

**Root Cause:** Build + preview server start takes >120s on slower machines or in CI.

---

## Goal

Enable reliable E2E test execution by increasing timeout or allowing manual preview start.

---

## Acceptance Criteria

- [ ] E2E tests run without timeout
- [ ] Documentation updated in README.md
- [ ] CI config updated if needed
- [ ] Both automated and manual modes work

---

## Solutions

### Option A: Increase Timeout (Quick Fix)

**File:** `playwright.config.ts`

```typescript
export default defineConfig({
  // ...
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    timeout: 300000, // 5 minutes (was 120000)
    env: { MOCK: 'true' }
  }
});
```

**Pros:** Simple, one-line change  
**Cons:** Still waits for build every test run

---

### Option B: Manual Preview Start (Recommended)

**File:** `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

const useWebServer = process.env.PW_SKIP_WEB_SERVER !== '1';

export default defineConfig({
  // ...
  webServer: useWebServer ? {
    command: 'npm run build && npm run preview',
    port: 4173,
    timeout: 180000,
    env: { MOCK: 'true' }
  } : undefined,
  use: {
    baseURL: useWebServer ? 'http://localhost:4173' : 'http://localhost:4173',
    // ...
  }
});
```

**Usage:**

```bash
# Automated mode (default)
npm run test:e2e

# Manual mode (start preview yourself)
npm run build && npm run preview &
PW_SKIP_WEB_SERVER=1 npm run test:e2e
```

**Pros:** Faster iteration, better for local dev  
**Cons:** Requires documentation

---

## Implementation Steps

### 1. Update playwright.config.ts

Choose Option B (recommended) or Option A.

### 2. Update README.md

Add E2E test section:

```markdown
## E2E Tests (Playwright)

### Automated Mode (Default)

```bash
npm run test:e2e
```

### Manual Mode (Faster for local dev)

```bash
# Terminal 1: Start preview server
npm run build && npm run preview &

# Terminal 2: Run E2E tests
PW_SKIP_WEB_SERVER=1 npm run test:e2e
```

### Single Test

```bash
npm run test:e2e -- e2e/auth-flow.spec.ts
npm run test:e2e -- --grep "login"
```
```

### 3. Update CI Config (if applicable)

If using GitHub Actions or similar, ensure timeout is set correctly.

---

## Files to Modify

| File | Changes |
|------|---------|
| `playwright.config.ts` | Add timeout increase or manual mode support |
| `README.md` | Document E2E test commands |

---

## Related Stories

- S71-01: Fix Placeholder Tests (unblock full test suite)
- S18-04: Fix E2E Timeout Failures (original E2E setup)
- S49-07: Test Pool Fixes (test infrastructure)

---

## Testing

Verify both modes work:

```bash
# Automated
npm run test:e2e

# Manual
npm run build && npm run preview &
PW_SKIP_WEB_SERVER=1 npm run test:e2e
```

---

## Definition of Done

- [ ] E2E tests run without timeout in automated mode
- [ ] Manual mode works with `PW_SKIP_WEB_SERVER=1`
- [ ] README.md updated with E2E instructions
- [ ] CI config updated if needed
