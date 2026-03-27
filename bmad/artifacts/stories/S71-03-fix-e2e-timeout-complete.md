# S71-03 — Fix E2E WebServer Timeout

**Status:** ✅ Complete (Already Implemented)  
**Priority:** High  
**Estimate:** 30 minutes

---

## Problem

Playwright E2E tests were failing with webServer timeout (120s) as reported in `del-2026-03-25-002`.

---

## Solution Implemented

The timeout has already been increased to 300000ms (5 minutes) in `playwright.config.ts`:

```typescript
const webServerConfig = process.env.PW_SKIP_WEB_SERVER === '1' 
  ? undefined 
  : { 
      command: 'npm run build && npm run preview', 
      port: 4173, 
      timeout: 300000,  // 5 minutes
      env: { MOCK: 'true' } 
    };
```

---

## Features

1. **Extended Timeout:** 300000ms (5 minutes) for slow builds
2. **Manual Mode Support:** `PW_SKIP_WEB_SERVER=1` to skip auto-start
3. **Mock Environment:** `MOCK: 'true'` for test isolation

---

## Usage

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

---

## Files Verified

| File | Status |
|------|--------|
| `playwright.config.ts` | ✅ Timeout set to 300000ms |
| `playwright.config.ts` | ✅ PW_SKIP_WEB_SERVER support |

---

## Acceptance Criteria

- [x] E2E tests run without timeout
- [x] Manual mode supported via `PW_SKIP_WEB_SERVER=1`
- [x] Configuration documented

---

## Related Stories

- S18-04: Fix E2E Timeout Failures (original E2E setup)
- S71-01: Fix Placeholder Tests (unblock full test suite)

---

## Definition of Done

- [x] Timeout increased to 5 minutes
- [x] Manual mode documented
- [x] Story documented in sprint summary
