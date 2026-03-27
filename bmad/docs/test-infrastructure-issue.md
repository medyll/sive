# Test Infrastructure Issue — Root Cause Analysis

**Date:** 2026-03-28  
**Status:** ✅ Root Cause Identified  
**Sprint:** S72-01

---

## Problem Statement

Components with heavy store integrations fail in browser test mode (vitest-browser-svelte).

**Affected Components:**
- BadgeDisplay.svelte
- UserProfileCard.svelte
- ShareGoalsModal.svelte
- WeeklyHistoryPanel.svelte

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

stdout: Component HTML renders correctly:
<div class="badge-display svelte-cvswio">
  <div class="progress-section svelte-cvswio">
    <h4 class="section-label">Next Badges</h4>
    ...
  </div>
</div>
```

### Component Renders Fine

The BadgeDisplay component renders correctly in the test environment. The issue was purely with how we accessed the rendered output.

---

## Solution

### Use render() Result Object

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BadgeDisplay from './BadgeDisplay.svelte';

describe('BadgeDisplay', () => {
  it('renders badge display', async () => {
    const { container, getByText } = render(BadgeDisplay);
    
    // Use container from render result
    expect(container.querySelector('.badge-display')).not.toBeNull();
    
    // Use getByText from render result
    const badgesSection = getByText('Badges Earned');
    await expect.element(badgesSection).toBeVisible();
  });
});
```

### Avoid page.container

```typescript
// DON'T do this:
import { page } from 'vitest/browser';
render(BadgeDisplay);
page.container // undefined!

// DO this instead:
const { container } = render(BadgeDisplay);
container // works!
```

---

## Files to Update

All component tests using `page.container` need to be updated:

| File | Status |
|------|--------|
| `BadgeDisplay.svelte.spec.ts` | Needs update |
| `UserProfileCard.svelte.spec.ts` | Needs update |
| `ShareGoalsModal.spec.ts` | Needs update |
| `WeeklyHistoryPanel.spec.ts` | Needs update |

---

## Next Steps

1. [x] Root cause identified
2. [ ] Update BadgeDisplay.svelte.spec.ts with correct API
3. [ ] Update UserProfileCard.svelte.spec.ts with correct API
4. [ ] Update other affected tests
5. [ ] Document pattern in test-patterns.md

---

## Related

- S71-01: Fix Placeholder Tests (where issue was discovered)
- S72-02: Fix vitest Configuration (now simpler - just need documentation)
- vitest-browser-svelte docs: https://github.com/vitest-dev/vitest-browser-svelte
