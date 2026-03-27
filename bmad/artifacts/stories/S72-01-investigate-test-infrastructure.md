# S72-01 — Investigate Test Infrastructure Root Cause

**Status:** ✅ Complete  
**Priority:** High  
**Estimate:** 2-3 hours  
**Actual:** 1 hour

---

## Goal

Identify the exact cause of component test failures with Svelte 5 runes and store integrations.

---

## Root Cause Identified ✅

**Issue:** Tests were using `page.container` which is `undefined` in vitest-browser-svelte.

**Correct API:** Use the `render()` result object:

```typescript
// WRONG (causes undefined error)
import { page } from 'vitest/browser';
render(BadgeDisplay);
expect.element(page.container).toBeVisible(); // page.container is undefined!

// CORRECT (works)
const { container, getByText } = render(BadgeDisplay);
expect(container.querySelector('.badge-display')).not.toBeNull();
await expect.element(getByText('Badges Earned')).toBeVisible();
```

---

## Evidence

### Debug Test Output

```
stdout: page.container: undefined
stdout: page.container type: undefined

stdout: render result: {
  "container": <div>...</div>,  // Container IS available here!
  "getByText": [Function],
  "getByRole": [Function],
  ...
}
```

### Test Results After Fix

```
✓ BadgeDisplay (11 tests)
  ✓ renders badge display component
  ✓ displays Next Badges section in non-compact mode
  ✓ hides Next Badges section in compact mode
  ✓ has progress-item elements
  ✓ renders without errors with default props
  ✓ displays progress bar with correct width style
  ✓ displays progress text with days
  ✓ displays streak badge progress
  ✓ displays words badge progress
  ✓ has progress-bar-container elements
  ✓ has section-label with "Next Badges" text

Test Files  1 passed (1)
Tests  11 passed (11)
```

---

## Solution Pattern

### Use render() Result Object

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Component from './Component.svelte';

describe('Component', () => {
  it('renders', () => {
    const { container, getByText, getByRole } = render(Component);
    
    // Use container from render result
    expect(container.querySelector('.component-class')).not.toBeNull();
    
    // Use query methods from render result
    const element = getByText('Some Text');
    // Note: don't await expect.element for simple queries
  });
});
```

### Avoid page.container

```typescript
// DON'T do this:
import { page } from 'vitest/browser';
render(Component);
page.container // undefined!

// DO this instead:
const { container } = render(Component);
container // works!
```

---

## Files Updated

| File | Action |
|------|--------|
| `bmad/docs/test-infrastructure-issue.md` | Root cause documented |
| `src/lib/elements/BadgeDisplay.svelte.spec.ts` | Fixed with correct API (11 tests passing) |
| `src/lib/test/debug.svelte.spec.ts` | Debug test created |

---

## Next Steps

1. [x] Root cause identified
2. [x] BadgeDisplay.svelte.spec.ts fixed (11/11 passing)
3. [ ] Update UserProfileCard.svelte.spec.ts with correct API
4. [ ] Update ShareGoalsModal.spec.ts with correct API
5. [ ] Update WeeklyHistoryPanel.spec.ts with correct API
6. [x] Document pattern in test-infrastructure-issue.md

---

## Related Stories

- S71-01: Fix Placeholder Tests (where issue was discovered)
- S72-02: Fix vitest Configuration (documentation update needed)
- S72-04: Rewrite BadgeDisplay Tests (complete)

---

## Definition of Done

- [x] Root cause documented
- [x] Recommended fix identified
- [x] Fix verified with BadgeDisplay tests (11/11 passing)
- [x] Pattern documented for team
