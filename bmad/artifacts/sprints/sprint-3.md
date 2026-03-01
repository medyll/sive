# Sprint 3 — Review Mode UI (Stub)

**Sprint ID:** sprint-3
**Epic:** Review Mode
**Period:** 2026-03-16 → 2026-03-31
**Total Points:** 21
**Status:** active

---

## Goal

Enable the `Review` button in the main toolbar to switch the app into Review Mode — a read-only audit interface. This sprint delivers the complete UI shell with stub data; AI analysis integration is deferred to a later sprint.

---

## Stories

| ID | Title | Pts | Priority |
|---|---|---:|---|
| S3-01 | Review Mode toggle & layout scaffold | 5 | Must |
| S3-02 | ReviewToolbar component | 2 | Must |
| S3-03 | ReviewText component | 2 | Must |
| S3-04 | ReviewReport component | 5 | Must |
| S3-05 | ReviewScreen orchestrator | 3 | Must |
| S3-06 | Unit tests — ReviewToolbar, ReviewReport | 2 | Should |
| S3-07 | E2E Review Mode tests | 2 | Should |

---

## Architecture

```
+page.svelte
├── reviewMode = false  →  normal workspace (Sprint 2)
└── reviewMode = true   →  <ReviewScreen />

ReviewScreen.svelte
├── <ReviewToolbar />        ← scope selector, run, back, export
└── <row> (split layout)
    ├── <ReviewText />       ← read-only text, 55%
    └── <ReviewReport />     ← structured report, 45%
```

New components in `src/lib/elements/`:
- `ReviewToolbar.svelte`
- `ReviewText.svelte`
- `ReviewReport.svelte`
- `ReviewScreen.svelte`

---

## Definition of Done

- [ ] Clicking `Review` in main toolbar renders the Review Mode layout
- [ ] ReviewToolbar: scope selector (3 options), Run analysis, ← Back to writing, Export report buttons
- [ ] ReviewText: read-only text panel (55%), static stub text
- [ ] ReviewReport: 7 sections visible (Inconsistencies, PoV, Narrative Threads, Tension Curve, Themes, Voices, Style) with stub items
- [ ] `← Back to writing` returns to the normal workspace
- [ ] Vitest unit tests pass for ReviewToolbar + ReviewReport
- [ ] Playwright E2E tests pass: toggle Review Mode, scope select, back to writing

---

## References

- `bmad/references/sive-layout.html:199-256` — Review Mode screen layout spec
- `bmad/references/project/7-review-mode.md` — Review Mode feature spec
- `src/routes/app/+page.svelte` — entry point, `reviewMode` state to add
