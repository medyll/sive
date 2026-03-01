# Sprint 2 — AI/Chat UI Foundation

**Goal:** Assemble the core writing interface — resizable split editor, multi-tab AI panel, Focus Mode, AI Spinner, and floating ChatBar — turning the five existing components into a usable application shell.

**Duration:** 2 weeks (flexible)
**Phase:** Implementation (begins this sprint)

---

## Stories

| ID | Epic | Title | Points | Priority |
|---:|---|---|---:|---|
| S2-01 | UI Shell | Main app layout wiring (split EditorPanel + AIPanel + resize) | 5 | Must |
| S2-02 | UI Shell | TabBar integration in AIPanel (Suggestions / Coherence / Style / History) | 3 | Must |
| S2-03 | UI Shell | Focus Mode (F11 / Ctrl+Shift+F, badge indicator) | 3 | Must |
| S2-04 | UI Shell | AI Spinner wiring + main toolbar | 2 | Must |
| S2-05 | UI Shell | ChatBar floating overlay (bottom-center, collapsible) | 2 | Should |
| S2-06 | QA | Unit tests — TabBar, ChatBar, Spinner (Vitest) | 2 | Should |
| S2-07 | QA | E2E layout tests — layout, tabs, focus mode (Playwright) | 3 | Should |

**Total:** 20 pts

---

## Dependencies

- S2-01 must be done before S2-02, S2-03, S2-04, S2-05
- S2-02 must be done before S2-06, S2-07

---

## Definition of Done

- Split layout renders at `src/routes/app` with EditorPanel + ResizeHandle + AIPanel
- TabBar shows 4 tabs; active tab state switches content
- Focus Mode shortcut hides right panel; badge appears when AI suggestions are available
- Spinner wires to a `aiProcessing` state prop
- ChatBar overlay renders bottom-center, collapsible
- Unit tests (Vitest) pass for TabBar, ChatBar, Spinner
- E2E tests (Playwright) pass for layout, tab switching, focus mode

---

## References

- `src/lib/elements/` — component implementations
- `src/lib/elements/mockups/` — generated mockups as reference
- `bmad/references/sive-layout.html` — semantic layout descriptor
- `bmad/references/project/1-interface-architecture.md`
- `bmad/references/project/10-appendix-prioritization-recommendation.md`
