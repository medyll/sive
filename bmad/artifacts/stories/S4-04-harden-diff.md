# Story S4-04 — HardenDiff component

**Epic:** Versioning
**Sprint:** Sprint 4
**Points:** 3
**Priority:** Must

## User Story

As an **author**, I want to select two Harden versions and view a side-by-side diff, so that I can understand what changed between them.

## Context

The History tab layout includes diff controls (version-a selector, version-b selector, "View differences" button) and a `diff-view` panel. See `sive-layout.html` lines 122-129.

## Acceptance Criteria

```gherkin
Given the History tab is active
When I view the diff controls
Then I see two selects (version A and version B) populated with Harden labels

Given two versions are selected
When I click "View differences"
Then the diff panel appears with stub additions (green) and deletions (red)

Given the diff is visible
When version A and version B are the same
Then an informational message "No differences" is shown

Given the diff panel is open
When no versions are selected
Then the "View differences" button is disabled
```

## Technical Notes

- Create `src/lib/elements/HardenDiff.svelte`
- Props: `snapshots: HardenSnapshot[]`
- Internal state: `versionA`, `versionB`, `diffVisible`
- Selects populated from `snapshots` (value = `snapshot.id`, label = `snapshot.label + date`)
- Stub diff: hardcoded paragraphs with `<ins>` (green) and `<del>` (red) spans
- "View differences" button `disabled` when versionA or versionB is empty
- `role="region"` on diff panel, `aria-label="Version diff"`

## Out of Scope

- Real text comparison algorithm
- YAML diff (bible, characters)

## Dependencies

- S4-02 (HardenSnapshot type)

## Definition of Done

- [ ] Both selects populated from snapshots prop
- [ ] View differences button disabled when selection incomplete
- [ ] Diff panel shows stub ins/del content when launched
- [ ] Same-version "No differences" message
- [ ] Build + autofixer clean
