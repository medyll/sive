# S3-01 — Review Mode Toggle & Layout Scaffold

**Sprint:** 3 | **Epic:** Review Mode | **Points:** 5 | **Priority:** Must

## Goal

Enable the `Review` button in the main toolbar to switch `+page.svelte` into Review Mode — hide the normal workspace and render the `<ReviewScreen>` component.

## Acceptance Criteria

- [ ] `reviewMode: boolean` state added to `+page.svelte`, default `false`
- [ ] `Review` toolbar button wired: `onclick={() => reviewMode = true}`, `aria-pressed={reviewMode}`, `aria-disabled` removed
- [ ] When `reviewMode = true`: workspace + ChatBar overlay hidden; `<ReviewScreen>` fills the viewport
- [ ] When `reviewMode = false`: normal writing mode restored
- [ ] No visual regressions on Sprint 2 layout

## References

- `src/routes/app/+page.svelte` — add `reviewMode` state, wire button, conditional render
- `src/lib/elements/ReviewScreen.svelte` — created in S3-05
