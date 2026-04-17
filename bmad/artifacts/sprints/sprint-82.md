# Sprint 82 — skill_coherence

**Status:** Planned  
**Target:** 2 jours  
**Priority:** P0 — First real AI skill

---

## Context

**Problem:** Coherence engine is a core feature but currently just an empty store. Need to implement the actual AI-powered inconsistency detection.

**Spec Reference:** `bmad/references/project/2-coherence-engine-pure-logic.md` + `5-ai-architecture-mcp-skills.md`

---

## Stories

### S82.01 — skill_coherence Implementation

**Goal:** Implement coherence detection skill with full YAML integration.

**Acceptance Criteria:**
- [ ] Reads bible.yaml, timeline.yaml, structure.yaml, narrator.yaml
- [ ] Reads current chapter (.md + .yaml)
- [ ] Extracts chapter states (characters, objects, locations)
- [ ] Compares against bible for contradictions
- [ ] Checks timeline compliance (flashbacks anchored)
- [ ] Checks POV compliance (narrator.yaml rules)
- [ ] Checks narrative threads (structure.yaml)
- [ ] Checks tension curve consistency
- [ ] Returns JSON alerts with confidence levels
- [ ] Pushes alerts to Coherence tab via Command Bus

**Skill Definition:**
```yaml
id: skill_coherence
description: Detect inconsistencies between chapter and bible
trigger: chapter_modified | explicit_request
steps:
  - command: ui.set_spinner
    params: { visible: true }
  - tool: read_bible
  - tool: read_timeline
  - tool: read_structure
  - tool: read_narrator
  - tool: read_chapter
    params: { id: "{{current_chapter}}" }
  - tool: extract_chapter_states
    params: { id: "{{current_chapter}}" }
  - prompt: |
      Compare chapter states against bible, timeline, structure, narrator.
      
      Check:
      1. Character/object/location status consistency
      2. Timeline compliance (flash-backs anchored, ellipses)
      3. POV compliance (declared focalizer in narrator.yaml)
      4. Active narrative threads referenced
      5. Tension level vs target curve
      6. Character voice compliance (register, tics, syntax)
      
      Return JSON array:
      [{
        "entity": "jean_dupont",
        "discrepancy_type": "status_contradiction",
        "confidence": "High",
        "note": "Chapter says Jean has revolver, bible says lost in Seine"
      }]
  - command: coherence.clear
  - command: coherence.push_alert
    params: { alerts: "{{prompt_result}}" }
    on_error: ignore
  - command: ui.open_tab
    params: { tab: "coherence" }
  - command: ui.set_spinner
    params: { visible: false }
```

**Files to Create:**
- `src/lib/skills/skills/skill_coherence.yaml` — Skill definition
- `src/lib/skills/skills/coherencePrompt.ts` — Prompt builder (optional)
- `src/lib/skills/skills/skill_coherence.spec.ts` — 8+ tests

**Estimated:** 8-10 hours

---

### S82.02 — Coherence UI Integration

**Goal:** Display coherence alerts in UI.

**Acceptance Criteria:**
- [ ] Alerts appear in Coherence tab
- [ ] Each alert shows: entity, type, confidence, note
- [ ] Confidence color-coded (High=red, Medium=orange, Low=yellow)
- [ ] Click alert → scroll to relevant passage
- [ ] Dismiss individual alerts
- [ ] Dismiss all alerts
- [ ] Alert count badge on tab

**Alert Display Format:**
```
┌─────────────────────────────────────────────┐
│ 🔴 HIGH                                     │
│ jean_dupont — Status contradiction          │
│ Chapter says Jean has revolver, bible says  │
│ lost in Seine (chapter_07)                  │
│                          [Dismiss] [Fix →]  │
└─────────────────────────────────────────────┘
```

**Files to Modify:**
- `src/lib/elements/CoherenceTab.svelte` — Alert display
- `src/lib/coherenceStore.svelte.ts` — Alert storage
- `src/routes/+page.svelte` — Tab integration

**Estimated:** 6-8 hours

---

## Dependencies

- ✅ MCP tools (S78) — read_bible, read_chapter, etc.
- ✅ Command Bus (S79) — coherence.push_alert
- ✅ YAML files (S80) — bible.yaml, etc.
- ✅ Skills Engine (S81) — Executes skill_coherence
- ❌ AI model (S84) — For prompt step (can mock)

---

## Test Strategy

**Skill Execution Test:**
```typescript
describe('skill_coherence', () => {
  it('detects character status contradiction', async () => {
    // Bible: revolver = lost
    // Chapter: Jean holds revolver
    await executeSkill('skill_coherence', { current_chapter: 'chapter_07' });
    expect(mockPushAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'jean_revolver',
        discrepancy_type: 'status_contradiction'
      })
    );
  });
  
  it('detects timeline violation', async () => {
    // Timeline: event at Day 47
    // Chapter references Day 100 (not yet reached)
    await executeSkill('skill_coherence', { current_chapter: 'chapter_05' });
    expect(mockPushAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        discrepancy_type: 'timeline_violation'
      })
    );
  });
  
  it('detects POV violation', async () => {
    // Narrator: Jean POV only
    // Chapter: Marie thoughts revealed
    await executeSkill('skill_coherence', { current_chapter: 'chapter_03' });
    expect(mockPushAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        discrepancy_type: 'pov_violation'
      })
    );
  });
});
```

---

## Discrepancy Types

| Type | Description | Example |
|------|-------------|---------|
| `status_contradiction` | Entity status differs from bible | Object lost but character has it |
| `timeline_violation` | Event referenced before it happens | "After the fire" before fire event |
| `pov_violation` | Narrator reveals unknown info | Marie's thoughts in Jean POV |
| `thread_missing` | Active thread not referenced | Investigation thread inactive too long |
| `tension_mismatch` | Tension level vs target | Target 8, actual 3 |
| `voice_violation` | Character voice inconsistent | Jean uses formal register |
| `location_impossible` | Character in two places | Jean at precinct AND crime scene |

---

## Success Metrics

- [ ] skill_coherence executable
- [ ] 5+ discrepancy types detected
- [ ] Alerts displayed in UI
- [ ] Click alert → scrolls to passage
- [ ] 15+ unit tests passing

---

## Risks

| Risk | Mitigation |
|------|-----------|
| AI misses contradictions | Lower confidence threshold, more examples |
| Too many false positives | Tune prompt, add "soft alerts" |
| Performance slow | Cache bible/timeline in memory |

---

**Ready for dev:** ✅ Yes (spec complete)  
**Blocked by:** S78, S79, S80, S81
