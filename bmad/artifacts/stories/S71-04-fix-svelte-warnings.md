# S71-04 — Fix Svelte Build Warnings

**Status:** 🟡 Todo  
**Priority:** Medium  
**Estimate:** 2-4 hours

---

## Problem

Svelte compiler warnings deferred since Sprint 25:

```
del-2026-03-25-001: "Svelte build warnings (a11y/state/css)"
Note: "Non-blocking Svelte warnings and LightningCSS at-rule errors — 
       delayed for later cleanup. E2E run should proceed."
```

**Warning Categories:**
- `a11y_*` — Accessibility warnings (missing aria-labels, roles)
- `state_*` — State reference issues (reactivity)
- `css_*` — Unused CSS selectors

---

## Goal

Audit and fix Svelte build warnings to achieve clean build output.

---

## Acceptance Criteria

- [ ] Run `npm run build` and capture all warnings
- [ ] Categorize warnings by severity
- [ ] Fix all `a11y_*` warnings (accessibility is critical)
- [ ] Fix `state_*` warnings (reactivity issues)
- [ ] Remove or justify unused CSS
- [ ] Build completes with 0 warnings (or documented exceptions)

---

## Implementation Steps

### Step 1: Capture Warnings

```bash
npm run build 2>&1 | tee build-warnings.log
```

### Step 2: Categorize

Create a spreadsheet or list:

| Warning | File | Severity | Action |
|---------|------|----------|--------|
| `a11y_missing_aria_label` | Button.svelte | High | Add aria-label |
| `state_referenced_locally` | Store.svelte | Medium | Fix closure |
| `css_unused_selector` | Style.svelte | Low | Remove |

### Step 3: Fix by Priority

**Priority 1: Accessibility (a11y_*)**
- Missing `aria-label` on buttons
- Missing `role` on interactive elements
- Missing `aria-labelledby` for dialogs
- Missing `alt` text on images

**Priority 2: State/Reactivity (state_*)**
- `state_referenced_locally` — Reference inside closure
- `state_assignment` — Incorrect state mutation

**Priority 3: CSS (css_*)**
- Remove unused selectors
- Or add `/* eslint-disable */` comment with justification

---

## Common Fixes

### Missing aria-label

**Before:**
```svelte
<button onclick={toggle}>✕</button>
```

**After:**
```svelte
<button onclick={toggle} aria-label="Close">✕</button>
```

### State Referenced Locally

**Before:**
```typescript
if (typeof localStorage !== 'undefined' && state.joined.length > 0) {
  queueMicrotask(() => {
    // Uses state.joined — captures initial value only
    for (const id of state.joined) {
      // ...
    }
  });
}
```

**After:**
```typescript
const joinedAtCheck = state.joined;
if (typeof localStorage !== 'undefined' && joinedAtCheck.length > 0) {
  queueMicrotask(() => {
    for (const id of joinedAtCheck) {
      // ...
    }
  });
}
```

### Unused CSS

**Before:**
```css
.unused-class {
  color: red;
}
```

**After:**
```css
/* Removed: .unused-class not used in template */
```

---

## Files Likely Affected

Based on deferred issue `del-2026-03-25-001`:

| Component | Likely Warnings |
|-----------|-----------------|
| `NotificationBell.svelte` | a11y_missing_aria_label |
| `ChallengeCard.svelte` | a11y_missing_aria_label |
| `WriterCard.svelte` | a11y_missing_aria_label |
| `BadgeDisplay.svelte` | a11y_missing_role |
| Various stores | state_referenced_locally |

---

## LightningCSS At-Rule Errors

**Problem:** `@tailwind` directives may cause warnings.

**Solution:** These are expected with Tailwind v4 — document and skip.

```markdown
## Skipped Warnings

- LightningCSS `@tailwind` directive warnings — Expected behavior with Tailwind v4
```

---

## Documentation

Create `bmad/artifacts/tests/build-warnings.md`:

```markdown
# Build Warnings Log

## Fixed Warnings

[List of fixed warnings with before/after]

## Skipped Warnings

- LightningCSS @tailwind directives — Expected with Tailwind v4
```

---

## Related Stories

- S71-01: Fix Placeholder Tests (test quality)
- S59-01: A11y Review (accessibility audit)
- S27-04: Mobile Panel Positioning (CSS work)

---

## Definition of Done

- [ ] All warnings captured and categorized
- [ ] All a11y warnings fixed
- [ ] All state warnings fixed
- [ ] Unused CSS removed or documented
- [ ] Build completes cleanly
- [ ] Skipped warnings documented
