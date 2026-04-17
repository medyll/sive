# S3-05 — ReviewScreen Orchestrator

**Sprint:** 3 | **Epic:** Review Mode | **Points:** 3 | **Priority:** Must
**Depends on:** S3-01, S3-02, S3-03, S3-04

## Goal

Create the `ReviewScreen` component — assembles ReviewToolbar + ReviewText + ReviewReport into the full review layout.

## Acceptance Criteria

- [ ] `src/lib/elements/ReviewScreen.svelte` created (Svelte 5 runes)
- [ ] Renders `<ReviewToolbar>` at the top
- [ ] Below toolbar: flex row with `<ReviewText>` (55%) and `<ReviewReport>` (45%)
- [ ] `scope` state (bindable, default `'current chapter'`) passed to ReviewToolbar
- [ ] `analysisRunning` state (default `false`) — set true when `onRunAnalysis` fires, false after 2s stub timeout
- [ ] `onExitReview` prop called when `← Back to writing` is triggered from toolbar
- [ ] Stub report data auto-loaded (hardcoded sample report TypeScript object)
- [ ] Layout fills full height (`height: 100%`, `display: flex`, `flex-direction: column`)

## References

- `src/lib/elements/AIPanel.svelte` — orchestration pattern reference
- `bmad/references/sive-layout.html:199-256` — full review screen layout
