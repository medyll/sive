# S2-06 — Unit Tests: TabBar, ChatBar, Spinner

**Sprint:** 2 | **Epic:** QA | **Points:** 2 | **Priority:** Should
**Depends on:** S2-02

## Goal

Write Vitest unit tests for the three interactive UI components: `TabBar`, `ChatBar`, and `Spinner`.

## Acceptance Criteria

### TabBar
- [ ] Renders all tabs from `tabs` prop
- [ ] Active tab has `active` class
- [ ] Clicking a tab calls `onChange` with the correct tab name
- [ ] Changing `activeTab` prop updates which tab appears active

### ChatBar
- [ ] Renders with placeholder text
- [ ] Pressing Enter calls `onSend` with input value and clears the field
- [ ] Clicking Send calls `onSend` with input value and clears the field
- [ ] Empty input does NOT call `onSend`

### Spinner
- [ ] Renders with class matching `size` prop (`small`, `medium`, `large`)
- [ ] Renders with `data-theme` attribute matching `theme` prop

## Test File Locations

- `src/lib/elements/TabBar.spec.ts`
- `src/lib/elements/ChatBar.spec.ts`
- `src/lib/elements/Spinner.spec.ts`

## Implementation Notes

- Follow the pattern of existing tests in `src/routes/auth/tests/server.spec.ts`
- Use `@testing-library/svelte` for component rendering
- Run with `npm run test:unit`

## References

- `src/lib/elements/TabBar.svelte`
- `src/lib/elements/ChatBar.svelte`
- `src/lib/elements/Spinner.svelte`
