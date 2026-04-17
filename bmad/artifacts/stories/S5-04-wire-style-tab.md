# Story S5-04 — Wire Style tab in AIPanel

**Epic:** Style
**Sprint:** Sprint 5
**Points:** 3
**Priority:** Must

## User Story

As an **author**, I want the Style tab to show my sliders and an Analyse button so that I can trigger a style scan on the current passage.

## Acceptance Criteria

```gherkin
Given the Style tab is open
When the panel renders
Then I see 4 sliders, an "Analyse this passage" button, and no results yet

Given I click "Analyse this passage"
When the stub analysis runs
Then the button shows "Analysing…" for ~2s, then 3 StyleSignal cards appear

Given results are showing
When I click "Analyse this passage" again
Then old results are cleared and new stub results appear
```

## Technical Notes

- Modify `src/lib/elements/AIPanel.svelte`
- Replace `{#if activeTab === 'Style'}<p>…</p>{/if}` stub
- Import `StyleSliders`, `StyleSignal`, `styleStore`
- Local state: `analysing: boolean`, `signals: StyleSignalData[]`
- `STUB_SIGNALS` array: 3 entries with varied location/signal/suggestion
- `handleAnalyse()`: set analysing=true → await sleep(1800) → set signals → set analysing=false
- Button class `.btn-analyse` (for E2E stability)

## Dependencies

- S5-01, S5-02, S5-03

## Definition of Done

- [ ] Sliders bound to styleStore values
- [ ] Analyse button visible, class=btn-analyse
- [ ] Stub results show after 1.8s
- [ ] Build + autofixer clean
