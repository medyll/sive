# Story S4-03 — HardenTimeline component

**Epic:** Versioning
**Sprint:** Sprint 4
**Points:** 3
**Priority:** Must

## User Story

As an **author**, I want to see a visual timeline of all my Harden snapshots in the History tab, so that I can navigate my version history at a glance.

## Context

The History tab currently shows a stub paragraph. Replace it with a proper HardenTimeline that reads from the harden store. See `sive-layout.html` lines 116-121.

## Acceptance Criteria

```gherkin
Given the History tab is active
When the HardenTimeline renders with stub data
Then each Harden point is visible with its label and date

Given the timeline has multiple points
When I click a point
Then it becomes selected (highlighted) and onSelectVersion is called with its id

Given no Hardens exist
When the HardenTimeline renders with empty data
Then a placeholder message is shown
```

## Technical Notes

- Create `src/lib/elements/HardenTimeline.svelte`
- Props: `snapshots: HardenSnapshot[]`, `selectedId?: string`, `onSelectVersion: (id: string) => void`
- Layout: horizontal scrollable row of timeline points
- Each point: circle marker + label chip + date + message truncated to 40 chars
- Selected point: distinct border/background colour
- Empty state: "No versions yet. Use 💾 New version to create one."

## Out of Scope

- Restore from version (Sprint 5+)

## Dependencies

- S4-02 (HardenSnapshot type + STUB_HARDENS)

## Definition of Done

- [ ] Points render for each snapshot
- [ ] Selected point visually distinct
- [ ] Click calls onSelectVersion
- [ ] Empty state visible when snapshots = []
- [ ] Build + autofixer clean
