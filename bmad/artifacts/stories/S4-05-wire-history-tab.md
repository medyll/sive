# Story S4-05 — Wire History tab in AIPanel

**Epic:** Versioning
**Sprint:** Sprint 4
**Points:** 2
**Priority:** Must

## User Story

As an **author**, I want the History tab to show the Harden timeline and diff controls, so that the versioning UI is accessible from the main workspace.

## Context

`AIPanel.svelte` already has a History tab stub (`<p>History — version timeline will appear here.</p>`). Replace it with HardenTimeline + HardenDiff. The harden store provides reactive data.

## Acceptance Criteria

```gherkin
Given I click the History tab
When the tab panel renders
Then I see the HardenTimeline with stub versions

Given the History tab is open
When I scroll the timeline
Then all Harden points are accessible

Given a Harden is confirmed via the modal (S4-01)
When I switch to History tab
Then the new entry appears in the timeline
```

## Technical Notes

- Edit `src/lib/elements/AIPanel.svelte`
- Import `HardenTimeline` and `HardenDiff` from `$lib/elements/`
- Import `hardenStore` from `$lib/harden.ts`
- Replace stub paragraph with:
  ```svelte
  <HardenTimeline snapshots={hardenStore.snapshots} {selectedId} onSelectVersion={(id) => selectedId = id} />
  <HardenDiff snapshots={hardenStore.snapshots} />
  ```
- `selectedId` as local `$state` in AIPanel

## Out of Scope

- Restoring a version from the timeline

## Dependencies

- S4-03 (HardenTimeline)
- S4-04 (HardenDiff)

## Definition of Done

- [ ] History tab shows HardenTimeline + HardenDiff
- [ ] Timeline updates reactively when hardenStore.add() is called
- [ ] Build passes, no regressions in other tabs
