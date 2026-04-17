# Sprint 5 — Style Settings UI

**Duration:** 2026-04-16 → 2026-04-30
**Capacity:** ~16 story points

## Sprint Goal

Deliver the Style tab with interactive sliders (Cynicism, Complexity, Rhythm, Density) and a stub passage-analysis flow showing style signal results.

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---|---:|---|
| S5-01 | Style | StyleSliders component | 3 | Must |
| S5-02 | Style | StyleSignal component | 2 | Must |
| S5-03 | Style | styleStore — reactive slider values | 2 | Must |
| S5-04 | Style | Wire Style tab in AIPanel | 3 | Must |
| S5-05 | Testing | Unit tests — StyleSliders + StyleSignal | 3 | Should |
| S5-06 | Testing | E2E — Style tab flow | 3 | Should |

**Total:** 16 points

## Dependencies

- S5-02 depends on S5-01 (card reuses slider styles)
- S5-04 depends on S5-01 + S5-02 + S5-03
- S5-05 depends on S5-01 + S5-02
- S5-06 depends on S5-04

## Definition of Done

- [ ] Style tab shows 4 sliders with labels and live value display
- [ ] Sliders bound to styleStore (values persist while tab is open)
- [ ] "Analyse this passage" button triggers 2s stub analysis
- [ ] 3 stub StyleSignal cards appear after analysis
- [ ] Vitest unit tests pass for StyleSliders + StyleSignal
- [ ] Playwright E2E tests pass for the Style tab flow

## Risks

- Real AI-backed style analysis (3.1 ingestion profiling) is **out of scope** — all signals are stub data.
- Slider values are in-memory only (no persistence to settings file in this sprint).
