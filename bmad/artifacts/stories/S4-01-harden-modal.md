# Story S4-01 — HardenModal component + toolbar button

**Epic:** Versioning
**Sprint:** Sprint 4
**Points:** 5
**Priority:** Must

## User Story

As an **author**, I want to click a `💾 New version` button and fill in a label and message, so that I can create a named snapshot of my current work.

## Context

The main toolbar already has Focus and Review buttons. A third action button `💾 New version` needs to be wired to open a modal. On confirm, a new Harden entry is added to the in-memory store. See `sive-layout.html` line 38.

## Acceptance Criteria

```gherkin
Given the app is open
When I click the "💾 New version" button
Then a HardenModal opens with a label field and a message textarea

Given the HardenModal is open
When I fill in a label and message and click Confirm
Then the modal closes and a new Harden entry is added to the store

Given the HardenModal is open
When I click Cancel
Then the modal closes with no new entry added

Given the HardenModal is open
When the label field is empty
Then the Confirm button is disabled
```

## Technical Notes

- Create `src/lib/elements/HardenModal.svelte`
- Props: `open: boolean`, `onConfirm: (label: string, message: string) => void`, `onCancel: () => void`
- Wire `💾 New version` button in `src/routes/app/+page.svelte` (add `hardenOpen` state)
- Modal uses `role="dialog"` with `aria-modal="true"` and `aria-labelledby`
- Confirm button `disabled` when label is empty or whitespace

## Out of Scope

- AI-generated commit message suggestions (Sprint 5+)
- File system persistence

## Dependencies

- None (standalone modal)

## Definition of Done

- [ ] HardenModal renders with label + message fields
- [ ] Confirm disabled when label empty
- [ ] Confirm calls onConfirm with values
- [ ] Cancel calls onCancel
- [ ] Button wired in +page.svelte
- [ ] Build passes
