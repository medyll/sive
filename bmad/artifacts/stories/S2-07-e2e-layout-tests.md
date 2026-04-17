# S2-07 — E2E Layout Tests (Playwright)

**Sprint:** 2 | **Epic:** QA | **Points:** 3 | **Priority:** Should
**Depends on:** S2-02

## Goal

Write Playwright E2E tests covering the main app layout: split view loads correctly, tab switching works, and Focus Mode toggles the right panel.

## Acceptance Criteria

- [ ] **Layout load:** navigating to `/app` (authenticated) shows EditorPanel + AIPanel side-by-side
- [ ] **TabBar:** clicking each tab (`Suggestions`, `Coherence`, `Style`, `History`) activates it; others are deactivated
- [ ] **Focus Mode via keyboard:** pressing `F11` hides the AIPanel; pressing again restores it
- [ ] **Focus Mode via button:** clicking the `Focus` toolbar button toggles the same state
- [ ] **ChatBar:** toggle button collapses/expands the ChatBar overlay
- [ ] **Spinner:** when `aiProcessing` is stubbed `true`, spinner element is visible in the AI panel

## Test File Location

- `e2e/app-layout.spec.ts`

## Implementation Notes

- Auth setup: reuse the helpers from `e2e/auth-login.spec.ts` (authenticated session fixture or `storageState`)
- Navigate to `/app` after authentication
- Use `page.keyboard.press('F11')` for keyboard shortcuts
- Spinner visibility test may require a test hook / data attribute to trigger `aiProcessing` state; add a `data-testid="ai-spinner"` attribute to `Spinner` if not present

## References

- `e2e/auth-login.spec.ts`
- `src/routes/app/+page.svelte`
- `src/lib/elements/Spinner.svelte`
- `playwright.config.ts`
