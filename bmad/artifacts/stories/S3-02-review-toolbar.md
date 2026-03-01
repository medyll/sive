# S3-02 — ReviewToolbar Component

**Sprint:** 3 | **Epic:** Review Mode | **Points:** 2 | **Priority:** Must

## Goal

Create the `ReviewToolbar` component — top toolbar for Review Mode with scope selector and action buttons.

## Acceptance Criteria

- [ ] `src/lib/elements/ReviewToolbar.svelte` created (Svelte 5 runes)
- [ ] Scope `<select>` with 3 options: `selected passage`, `current chapter`, `entire volume`; bound to `scope` prop
- [ ] `Run analysis` button — calls `onRunAnalysis()` prop callback
- [ ] `← Back to writing` button — calls `onExitReview()` prop callback
- [ ] `Export report` button — calls `onExport()` prop callback; `aria-disabled="true"` (stub)
- [ ] Props: `scope` ($bindable, default `'current chapter'`), `onRunAnalysis`, `onExitReview`, `onExport`, `analysisRunning: boolean`
- [ ] `Run analysis` shows visual loading state when `analysisRunning=true`

## References

- `bmad/references/sive-layout.html:202-208` — toolbar spec
- `src/lib/elements/TabBar.svelte` — style/pattern reference
