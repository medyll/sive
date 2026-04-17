# Sprint 81 — Skills Engine

**Status:** Planned  
**Target:** 2 jours  
**Priority:** P0 — AI cognition layer

---

## Context

**Problem:** Skills define AI behavior but need an engine to execute them. Currently: **0 exécuteur de skills**.

**Spec Reference:** `bmad/references/project/5-ai-architecture-mcp-skills.md` §5.6

---

## Stories

### S81.01 — Skills Engine: Execution Core

**Goal:** Implement skill execution engine with context management.

**Acceptance Criteria:**
- [ ] `executeSkill(skillId, input)` — Main execution function
- [ ] Context object passed between steps
- [ ] MCP tool step execution
- [ ] Prompt step execution (AI call)
- [ ] Command step execution
- [ ] Variable resolution (`{{variable}}` substitution)
- [ ] Error handling per step (ignore/abort/notify)
- [ ] Execution logging

**Skill Execution Cycle:**
```
1. INIT — Load skill YAML, init context
2. FOR EACH STEP:
   - if tool → call MCP tool, store result
   - if prompt → build prompt + context, call AI, store result
   - if command → emit command, store result
3. END — Clear context, log execution
```

**Files to Create:**
- `src/lib/skills/skillEngine.ts` — Core execution
- `src/lib/skills/context.ts` — Context management
- `src/lib/skills/skillEngine.spec.ts` — 10+ tests

**Estimated:** 8-10 hours

---

### S81.02 — Skill YAML Loader + Validator

**Goal:** Load and validate skill YAML files.

**Acceptance Criteria:**
- [ ] `loadSkill(skillId)` — Loads skill YAML
- [ ] Validates skill structure (id, steps, trigger)
- [ ] Validates step types (tool/prompt/command)
- [ ] Validates command names against registry
- [ ] Returns typed Skill object
- [ ] Error messages for invalid skills

**Skill YAML Schema:**
```yaml
id: skill_coherence
description: Detect inconsistencies
trigger: chapter_modified | explicit_request
steps:
  - command: ui.set_spinner
    params: { visible: true }
  - tool: read_bible
  - tool: read_timeline
  - prompt: |
      Compare chapter against bible...
      Return JSON: [{entity, discrepancy_type, confidence, note}]
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
- `src/lib/skills/skillLoader.ts` — YAML loader
- `src/lib/skills/skillTypes.ts` — Skill type definitions
- `src/lib/skills/skillLoader.spec.ts` — 5+ tests

**Estimated:** 4-6 hours

---

## Dependencies

- ✅ MCP tools (S78) — Called by skill steps
- ✅ Command Bus (S79) — Commands emitted by skills
- ✅ YAML types (S80) — Data loaded by MCP tools
- ❌ AI model routing — Needed for prompt steps (S84)

**Note:** S81 can use **mock AI responses** for testing. Real AI routing comes in S84.

---

## Test Strategy

**Execution Test:**
```typescript
describe('executeSkill', () => {
  it('executes all steps in order', async () => {
    await executeSkill('skill_test', { chapter: 'chapter_01' });
    expect(mockReadBible).toHaveBeenCalled();
    expect(mockPrompt).toHaveBeenCalled();
    expect(mockEmitCommand).toHaveBeenCalledWith('coherence.push_alert');
  });
  
  it('passes context between steps', async () => {
    await executeSkill('skill_test', {});
    expect(mockPrompt).toHaveBeenCalledWith(
      expect.stringContaining('bible.yaml') // Context injected
    );
  });
  
  it('handles on_error: ignore', async () => {
    mockCommand.mockRejectedValue(new Error('fail'));
    await executeSkill('skill_test', {});
    // Should continue without throwing
  });
});
```

---

## Context Management

**Context Schema:**
```typescript
interface SkillContext {
  skill_id: string;
  trigger: string;
  input: Record<string, unknown>;    // Skill input params
  results: Record<string, unknown>;  // Step results
  meta: {
    started_at: string;
    current_step: number;
    total_steps: number;
    errors: string[];
  };
}
```

**Variable Resolution:**
```typescript
// In skill YAML: "{{current_chapter}}"
// Resolved from:
// 1. context.input.current_chapter
// 2. context.results.result_read_chapter
// 3. app.state.current_chapter
```

---

## Success Metrics

- [ ] Skills executable
- [ ] Context passed between steps
- [ ] Variables resolved correctly
- [ ] Commands emitted
- [ ] 15+ unit tests passing

---

## Risks

| Risk | Mitigation |
|------|-----------|
| AI prompt too long | Truncate context intelligently |
| Skill loops infinitely | Max step limit (100) |
| Context lost between steps | Immutable context object |

---

**Ready for dev:** ✅ Yes (spec complete)  
**Blocked by:** S78 (MCP), S79 (Command Bus), S80 (YAML)
