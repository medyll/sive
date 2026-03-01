# S3-04 — ReviewReport Component

**Sprint:** 3 | **Epic:** Review Mode | **Points:** 5 | **Priority:** Must

## Goal

Create the `ReviewReport` component — the structured audit report panel with 7 collapsible sections and stub data.

## Acceptance Criteria

- [ ] `src/lib/elements/ReviewReport.svelte` created (Svelte 5 runes)
- [ ] 7 sections rendered (all with stub data):
  1. **Inconsistencies** — `{entity, description, confidence}` items
  2. **Point of View** — `{location, detected_deviation}` items
  3. **Narrative Threads** — `{thread_id, status, note}` items
  4. **Tension Curve** — placeholder chart element (no real chart lib needed; stub `<div role="img" aria-label="Tension curve chart">`)
  5. **Themes & Motifs** — `{motif_id, presence, consistency}` items
  6. **Character Voices** — `{character_id, register_deviation, example}` items
  7. **Style & Rhythm** — `{signal_type, location, suggestion}` items
- [ ] Each section has a heading and at least 1 stub item
- [ ] Report items use a `ReportItem` sub-component (inline in the same file or separate)
- [ ] `report` prop accepts typed stub data or `null` (shows "Run analysis to generate report" placeholder)
- [ ] Accessible: section headings use `<h3>`, items use `role="article"`

## References

- `bmad/references/sive-layout.html:222-254` — report sections spec
- `bmad/references/project/7-review-mode.md` — report contents spec
