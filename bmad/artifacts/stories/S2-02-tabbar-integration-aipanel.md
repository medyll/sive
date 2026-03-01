# S2-02 — TabBar Integration in AIPanel

**Sprint:** 2 | **Epic:** UI Shell | **Points:** 3 | **Priority:** Must
**Depends on:** S2-01

## Goal

Wire `TabBar` inside `AIPanel` with the four contextual tabs defined in `sive-layout.html`: Suggestions, Coherence, Style, History. Each tab shows a placeholder content panel. Active tab state is managed at the `AIPanel` level.

## Acceptance Criteria

- [ ] `AIPanel` renders a `TabBar` at the top with tabs: `["Suggestions", "Coherence", "Style", "History"]`
- [ ] Default active tab is `"Suggestions"`
- [ ] Clicking a tab updates the active tab state and shows the corresponding placeholder content
- [ ] `TabBar` receives `activeTab` and `onChange` props correctly
- [ ] Tab content panels are labelled with the tab name (placeholder `<p>` or slot); no business logic required this sprint
- [ ] `AIPanel` exposes a prop `activeTab?: string` to allow external override

## Implementation Notes

- Update `AIPanel.svelte`: remove the `events` loop, add `TabBar` + tab content switching
- Use `$state` for `activeTab` inside `AIPanel`; sync with prop via `$effect`
- Tab IDs match those in `sive-layout.html`: `tab-suggestions`, `tab-coherence`, `tab-style`, `tab-history`

## References

- `src/lib/elements/TabBar.svelte`
- `src/lib/elements/AIPanel.svelte`
- `bmad/references/sive-layout.html` — `#ai-tabs`, tab definitions
- `bmad/references/project/1-interface-architecture.md` — §1.3 Multi-Tab Right Panel
