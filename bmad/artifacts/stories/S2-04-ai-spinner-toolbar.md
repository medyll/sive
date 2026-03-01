# S2-04 — AI Spinner Wiring + Main Toolbar

**Sprint:** 2 | **Epic:** UI Shell | **Points:** 2 | **Priority:** Must
**Depends on:** S2-01

## Goal

Wire the `Spinner` component inside `AIPanel` so it appears while `aiProcessing = true`. Add the main toolbar at the top of the app with project/chapter context label and action buttons.

## Acceptance Criteria

- [ ] `AIPanel` renders `Spinner` (size `medium`) when `aiProcessing` prop is `true`; hides it when `false`
- [ ] Spinner is positioned above the tab content area (below the `TabBar`)
- [ ] Main toolbar renders at the top of `src/routes/app/+page.svelte`:
  - Project / chapter label (placeholder text: `"My project / Chapter 1"`)
  - `Focus` button (triggers Focus Mode — same as S2-03 shortcut)
  - `Review` button (disabled / stub for now)
  - `💾 New version` button (disabled / stub for now)
  - `⚙` Settings button (disabled / stub for now)
- [ ] Toolbar uses the `toolbar` mockup as reference

## Implementation Notes

- Add `aiProcessing: boolean = false` prop to `AIPanel`
- For the toolbar, use `src/lib/elements/mockups/toolbar.svelte` as reference
- No routing or real actions needed for Review / Harden / Settings yet — `aria-disabled` is sufficient
- `Focus` button should toggle the `focusMode` state (passed as a callback from the page)

## References

- `src/lib/elements/Spinner.svelte`
- `src/lib/elements/AIPanel.svelte`
- `src/lib/elements/mockups/toolbar.svelte`
- `bmad/references/sive-layout.html` — `#main-toolbar`, `#ai-spinner`
- `bmad/references/project/1-interface-architecture.md` — §1.5 AI Spinner
