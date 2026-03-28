# Sprint 78 — Accessibility Audit (WCAG 2.1 AA)

**Status:** In Progress  
**Target Date:** 2026-03-30  
**Goal:** Achieve WCAG 2.1 AA compliance for all user-facing pages.

---

## Stories

### S78-01: Accessibility Audit with axe-core
- Run automated audit on all pages
- Document violations by severity
- Create remediation plan

### S78-02: Fix Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Focus indicators visible
- Skip links for main content

### S78-03: Fix Screen Reader Support
- Proper ARIA labels
- Live regions for dynamic content
- Semantic HTML structure

### S78-04: Fix Color Contrast
- All text meets 4.5:1 ratio
- UI components meet 3:1 ratio
- Dark mode tested

### S78-05: Accessibility E2E Tests
- Keyboard-only navigation tests
- Screen reader tests (manual)
- axe-core in CI pipeline

---

## Known Issues (from build warnings)

| File | Issue | Severity |
|------|-------|----------|
| `src/routes/feed/+page.svelte:25` | `<nav>` with `role="tablist"` | High |
| `src/routes/leaderboard/+page.svelte:88` | Same issue | High |
| `src/routes/settings/+page.svelte:59` | Label without associated control | High |
| `src/lib/elements/NotificationBell.svelte:44` | Click without keyboard handler | High |
| `src/lib/elements/GoalTemplateModal.svelte:33` | Click handler without role | Medium |
| `src/routes/+page.svelte:1066` | Unused CSS selector | Low |

---

## Acceptance Criteria

- [ ] 0 critical axe-core violations
- [ ] 0 high severity violations
- [ ] <10 medium severity violations (documented exceptions)
- [ ] Keyboard navigation works on all pages
- [ ] Screen reader announces all interactive elements
- [ ] Color contrast passes automated check
- [ ] Accessibility statement published

---

**Created:** 2026-03-29  
**Planning Role:** PM
