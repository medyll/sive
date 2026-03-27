# S71-02 — Fix Critical Test — page.svelte.spec.ts

**Status:** 🟡 Todo  
**Priority:** High (Blocking)  
**Estimate:** 30-60 minutes

---

## Problem

`src/routes/page.svelte.spec.ts` fails with:

```
TypeError: Cannot read properties of undefined (reading 'documents')
    at _page src/routes/+page.svelte:116:30
```

**Root Cause:** Test renders `+page.svelte` without providing required `data` prop (documents, activeDocumentId).

---

## Goal

Fix the test by providing proper mock data so the page component can render successfully.

---

## Acceptance Criteria

- [ ] Test renders without crashing
- [ ] Mock data provided for `data.documents` and `data.activeDocumentId`
- [ ] Test verifies page renders document list
- [ ] Test verifies editor panel mounts
- [ ] All tests passing

---

## Implementation

### Current Failing Test

```typescript
import { render } from '@testing-library/svelte';
import Page from './+page.svelte';

it('should render h1', () => {
  const { getByText } = render(Page);
  // FAILS: Cannot read properties of undefined (reading 'documents')
});
```

### Fixed Test

```typescript
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

const mockData = {
  documents: [
    { id: 'doc1', title: 'Test Document', content: 'Hello world', tags: [], createdAt: Date.now(), updatedAt: Date.now() }
  ],
  activeDocumentId: 'doc1'
};

it('should render document list', () => {
  const { container } = render(Page, { data: mockData });
  
  expect(screen.getByText('Test Document')).toBeInTheDocument();
  expect(container.querySelector('.document-list')).toBeInTheDocument();
});

it('should render editor panel', () => {
  const { container } = render(Page, { data: mockData });
  
  expect(container.querySelector('.editor-panel')).toBeInTheDocument();
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/routes/page.svelte.spec.ts` | Add mock data, fix render call, update assertions |

---

## Mock Data Structure

```typescript
interface PageData {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
  }>;
  activeDocumentId: string;
}
```

---

## Related Stories

- S71-01: Fix Placeholder Tests (component specs)
- S71-06: Update Test Documentation (test patterns)
- S8-01: Document Persistence (documents schema)

---

## Definition of Done

- [ ] Test renders without errors
- [ ] Mock data matches `+page.server.ts` load function output
- [ ] All assertions passing
- [ ] Test documented in sprint summary
