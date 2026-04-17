# S71-06 — Update Test Documentation

**Status:** 🟡 Todo  
**Priority:** Low  
**Estimate:** 1 hour

---

## Problem

Test patterns, conventions, and best practices are not documented, leading to inconsistent test quality across the codebase.

---

## Goal

Create comprehensive test documentation to guide future test writing and maintain consistency.

---

## Acceptance Criteria

- [ ] Create `bmad/artifacts/tests/test-patterns.md`
- [ ] Document: Mock setup patterns
- [ ] Document: Store reset patterns
- [ ] Document: Async testing (queueMicrotask)
- [ ] Document: Component testing conventions
- [ ] Document: E2E test structure
- [ ] Link from `bmad/artifacts/tests/README.md`

---

## Implementation

### File to Create

`bmad/artifacts/tests/test-patterns.md`

---

## Content Outline

### 1. Mock Setup

```markdown
## Mock Setup

### localStorage Mock

```typescript
global.localStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as any;
```

### Store Mocking

```typescript
vi.mock('$lib/badgesStore.svelte', () => ({
  badgesStore: {
    earnedBadges: [{ icon: '✍️', name: 'Writer' }]
  }
}));
```
```

### 2. Store Reset Patterns

```markdown
## Store Reset Patterns

Always reset stores between tests to ensure isolation:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  challengeStore.reset();
  goalsStore.reset();
  activityStore.reset();
});
```
```

### 3. Async Testing

```markdown
## Async Testing

### queueMicrotask Pattern

For fire-and-forget async operations:

```typescript
it('emits event via queueMicrotask', async () => {
  store.doSomething();
  await new Promise(r => queueMicrotask(r));
  expect(eventEmitted).toBe(true);
});
```

### Fake Timers

For setTimeout/setInterval:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

it('auto-dismisses after 6s', () => {
  store.notify('Test');
  vi.advanceTimersByTime(6000);
  expect(store.items).toHaveLength(0);
});

afterEach(() => {
  vi.useRealTimers();
});
```
```

### 4. Component Testing

```markdown
## Component Testing

### Basic Render Test

```typescript
import { render, screen } from '@testing-library/svelte';
import Component from './Component.svelte';

it('renders with props', () => {
  const { container } = render(Component, {
    props: { title: 'Test' }
  });
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### User Interactions

```typescript
import { fireEvent } from '@testing-library/svelte';

it('handles click', async () => {
  const onClick = vi.fn();
  const { getByText } = render(Component, {
    props: { onClick }
  });
  
  await fireEvent.click(getByText('Click me'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

### Store Integration

```typescript
it('updates when store changes', async () => {
  render(Component);
  
  store.setValue('new value');
  await tick(); // Wait for Svelte reactivity
  
  expect(screen.getByText('new value')).toBeInTheDocument();
});
```
```

### 5. E2E Test Structure

```markdown
## E2E Test Structure (Playwright)

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Page Object Pattern

```typescript
class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/auth/login');
  }
  
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```
```

### 6. Test File Naming

```markdown
## Test File Naming

- Unit tests: `*.spec.ts` (e.g., `challengeStore.spec.ts`)
- Component tests: `*.spec.ts` (e.g., `BadgeDisplay.spec.ts`)
- E2E tests: `*.spec.ts` in `e2e/` folder (e.g., `e2e/auth-flow.spec.ts`)
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `bmad/artifacts/tests/test-patterns.md` | Create |
| `bmad/artifacts/tests/README.md` | Update with link |

---

## Related Stories

- S71-01: Fix Placeholder Tests (applies patterns)
- S49-06: Document Test Patterns Library (original plan)

---

## Definition of Done

- [ ] `test-patterns.md` created with all sections
- [ ] Examples are accurate and copy-paste ready
- [ ] Linked from `tests/README.md`
- [ ] Documented in sprint summary
