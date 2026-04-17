# Sprint 83 — skill_review + skill_style

**Status:** Planned  
**Target:** 2-3 jours  
**Priority:** P1 — Advanced AI features

---

## Context

**Problem:** Review mode and style analysis are key differentiators but currently non-functional.

**Spec Reference:** `bmad/references/project/7-review-mode.md` + `3-stylistic-mastery-voice.md`

---

## Stories

### S83.01 — skill_review Implementation

**Goal:** Implement audit report skill for Review Mode.

**Acceptance Criteria:**
- [ ] Reads all YAML files (bible, timeline, structure, themes, narrator)
- [ ] Reads full chapter or scope
- [ ] Generates 8-section structured report
- [ ] Report exported as JSON
- [ ] Report displayed in Review screen
- [ ] Passages highlighted and linked to report sections

**Report Sections:**
1. **Inconsistencies** — Character/object/timeline contradictions
2. **POV** — Focalization compliance
3. **Narrative Threads** — Unresolved open threads
4. **Tension Curve** — Consistency vs target
5. **Themes & Motifs** — Presence and consistency
6. **Character Voices** — Register/tics/syntax compliance
7. **Language Tics** — Lexical repetitions
8. **Narrative Density** — Ellipsis vs detailed scene

**Skill Definition:**
```yaml
id: skill_review
description: Produce structured audit report
trigger: review_mode
steps:
  - command: ui.set_spinner
    params: { visible: true }
  - tool: read_bible
  - tool: read_timeline
  - tool: read_structure
  - tool: read_themes
  - tool: read_narrator
  - tool: read_chapter
    params: { id: "{{scope}}" }
  - prompt: |
      Analyse text and produce structured JSON report:
      {
        "inconsistencies": [...],
        "pov": {...},
        "narrative_threads": [...],
        "tension": {...},
        "themes": [...],
        "voices": [...],
        "language_tics": [...],
        "narrative_density": {...}
      }
      No text modifications. Report only.
  - command: app.navigate_to
    params: { screen: "review" }
  - command: review.push_report
    params: { report: "{{prompt_result}}" }
  - command: review.highlight_passage
    params: { passages: "{{flagged_passages}}" }
  - command: ui.set_spinner
    params: { visible: false }
```

**Files to Create:**
- `src/lib/skills/skills/skill_review.yaml` — Skill definition
- `src/lib/skills/skills/skill_review.spec.ts` — 8+ tests

**Estimated:** 8-10 hours

---

### S83.02 — Review Mode UI

**Goal:** Display audit report in Review screen.

**Acceptance Criteria:**
- [ ] Report sections collapsible
- [ ] Each section shows findings list
- [ ] Click finding → scroll to passage
- [ ] Passage highlighted in editor
- [ ] Export report as .md or .pdf
- [ ] Read-only mode (no editing)

**Files to Modify:**
- `src/lib/elements/ReviewScreen.svelte` — Report display
- `src/routes/review/+page.svelte` — Review page

**Estimated:** 6-8 hours

---

### S83.03 — skill_style Implementation

**Goal:** Implement stylistic analysis skill for selected passages.

**Acceptance Criteria:**
- [ ] Reads narrator.yaml for style profile
- [ ] Analyses selected passage
- [ ] Flags: language tics, repetitions, rhythm breaks, narrative density
- [ ] Returns signals with location + suggestion
- [ ] Pushes signals to Style tab

**Skill Definition:**
```yaml
id: skill_style
description: Stylistic analysis of selected passage
trigger: analyse_passage_button | text_selection
steps:
  - tool: read_character_sheet
    params: { id: "{{active_narrator}}" }
  - prompt: |
      Analyse passage according to ingested style profile.
      
      Flag:
      - Language tics (overused words/phrases)
      - Lexical repetitions (same word within N sentences)
      - Rhythm breaks (sentence length anomalies)
      - Narrative density (telling vs showing ratio)
      
      Format: list of signals with location and suggestion.
      [{
        "location": {"start": 120, "end": 180},
        "signal": "repetition",
        "suggestion": "Replace second 'suddenly' with synonym"
      }]
  - command: style.clear
  - command: style.push_signal
    params: { signals: "{{prompt_result}}" }
    on_error: ignore
  - command: ui.open_tab
    params: { tab: "style" }
```

**Files to Create:**
- `src/lib/skills/skills/skill_style.yaml` — Skill definition
- `src/lib/skills/skills/skill_style.spec.ts` — 6+ tests

**Estimated:** 6-8 hours

---

### S83.04 — Style Tab UI

**Goal:** Display style signals in Style tab.

**Acceptance Criteria:**
- [ ] Signals listed with type icon
- [ ] Click signal → highlight passage
- [ ] Dismiss individual signals
- [ ] Dismiss all signals
- [ ] Signal count badge

**Files to Modify:**
- `src/lib/elements/StyleTab.svelte` — Signal display
- `src/lib/styleStore.svelte.ts` — Signal storage

**Estimated:** 4-6 hours

---

## Dependencies

- ✅ MCP tools (S78)
- ✅ Command Bus (S79)
- ✅ YAML files (S80)
- ✅ Skills Engine (S81)
- ✅ skill_coherence pattern (S82)

---

## Test Strategy

**Review Report Test:**
```typescript
describe('skill_review', () => {
  it('generates 8-section report', async () => {
    await executeSkill('skill_review', { scope: 'chapter_07' });
    const report = mockPushReport.mock.calls[0][0];
    expect(report.inconsistencies).toBeDefined();
    expect(report.pov).toBeDefined();
    expect(report.narrative_threads).toBeDefined();
    expect(report.tension).toBeDefined();
    expect(report.themes).toBeDefined();
    expect(report.voices).toBeDefined();
    expect(report.language_tics).toBeDefined();
    expect(report.narrative_density).toBeDefined();
  });
});
```

**Style Signal Test:**
```typescript
describe('skill_style', () => {
  it('detects repetition', async () => {
    await executeSkill('skill_style', { 
      passage: 'Suddenly he ran. Suddenly she fell.' 
    });
    expect(mockPushSignal).toHaveBeenCalledWith(
      expect.objectContaining({
        signal: 'repetition',
        suggestion: expect.stringContaining('Suddenly')
      })
    );
  });
});
```

---

## Success Metrics

- [ ] skill_review generates 8-section report
- [ ] Review screen displays report
- [ ] skill_style detects style issues
- [ ] Style tab displays signals
- [ ] 25+ unit tests passing

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Report too long | Summarize sections, expand on click |
| AI too harsh on style | Frame as "suggestions" not "errors" |
| Style analysis subjective | Use narrator.yaml as objective baseline |

---

**Ready for dev:** ✅ Yes (spec complete)  
**Blocked by:** S78, S79, S80, S81, S82
