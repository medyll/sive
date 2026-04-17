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

---

## Implementation Notes

**Date:** 2026-03-01
**Files changed:**
- `src/lib/elements/AIPanel.svelte` — Refactorisé : suppression du loop `events`, ajout de `TabBar` + switching de contenu par onglet; `activeTab` en `$bindable` pour permettre l'override externe

**Notable decisions:**
- `$bindable` pour `activeTab` plutôt que `$state` + `$effect` de synchronisation — évite le bug "captures initial value only" et permet le two-way binding depuis le parent
- Contenu des onglets en placeholders simples (`<p>`) — le vrai contenu (diff-view, coherence alerts, timeline) viendra dans les sprints suivants
- `TABS` en `as const` tuple pour typage strict de l'union `Tab`

**Known limitations:**
- Onglets sans contenu réel (placeholders) — wiring métier en Sprint 3+
- Spinner non encore intégré dans AIPanel (S2-04)

