# Sprint 80 — YAML File System + TypeScript Types

**Status:** Planned  
**Target:** 2-3 jours  
**Priority:** P0 — Data model foundation

---

## Context

**Problem:** MCP tools need actual YAML files to read/write. Currently: **0 fichier YAML, 0 types TypeScript**.

**Spec Reference:** `bmad/references/project/4-intelligence-data.md`

---

## Stories

### S80.01 — TypeScript Types from YAML Schemas

**Goal:** Generate TypeScript types from YAML schemas in `4-intelligence-data.md`.

**Acceptance Criteria:**
- [ ] `BibleData` interface (characters, locations, objects, relations, vehicles)
- [ ] `TimelineData` interface (events, ellipses)
- [ ] `StructureData` interface (acts, threads, tension_curve)
- [ ] `ThemesData` interface (themes, motifs, symbols)
- [ ] `NarratorData` interface (type, focalization, voice)
- [ ] `ChapterData` interface (states, transitions, narrator)
- [ ] `CharacterSheet` interface (expanded character)
- [ ] 50+ sub-interfaces (Character, Location, Event, etc.)
- [ ] All types exported from `src/lib/types/types.ts`

**Files to Create:**
- `src/lib/types/types.ts` — All TypeScript types (500+ lines)

**Estimated:** 6-8 hours

---

### S80.02 — YAML File Store (In-Memory + Disk)

**Goal:** Implement YAML loading/saving with in-memory cache.

**Acceptance Criteria:**
- [ ] `loadYaml(path)` — Loads YAML file to memory
- [ ] `saveYaml(path, data)` — Saves memory to YAML file
- [ ] In-memory cache for fast access
- [ ] Auto-save on modifications
- [ ] Error handling for missing/invalid files
- [ ] Works in Node.js and browser (mock mode)

**Files to Create:**
- `src/lib/mcp/yamlStore.ts` — YAML loading/saving
- `src/lib/mcp/yamlStore.spec.ts` — 8+ tests

**Estimated:** 6-8 hours

---

### S80.03 — Project File System Structure

**Goal:** Create default YAML files and folder structure.

**Acceptance Criteria:**
- [ ] `bmad/data/bible.yaml` — Created with example data
- [ ] `bmad/data/timeline.yaml` — Created with example events
- [ ] `bmad/data/structure.yaml` — Created with 3-act structure
- [ ] `bmad/data/themes.yaml` — Created with example themes
- [ ] `bmad/data/narrator.yaml` — Created with default voice
- [ ] `bmad/data/chapters/chapter_01/` — Example chapter folder
- [ ] `bmad/data/chapters/chapter_01/chapter_01.yaml` — Chapter states
- [ ] `bmad/data/chapters/chapter_01/chapter_01.md` — Example text

**Files to Create:**
- `bmad/data/bible.yaml` — Example bible (2 characters, 2 locations)
- `bmad/data/timeline.yaml` — Example timeline (5 events)
- `bmad/data/structure.yaml` — Example 3-act structure
- `bmad/data/themes.yaml` — Example themes/motifs
- `bmad/data/narrator.yaml` — Default narrator voice
- `bmad/data/chapters/chapter_01/chapter_01.yaml` — Chapter 1 states
- `bmad/data/chapters/chapter_01/chapter_01.md` — Chapter 1 text (500 words)

**Estimated:** 4-6 hours

---

## Dependencies

- ✅ YAML schemas documented (`4-intelligence-data.md`)
- ✅ MCP tools spec'd (S78) — Will use these types
- ❌ MCP tools not implemented yet — Can't load real data

---

## Test Strategy

**Type Safety Test:**
```typescript
describe('TypeScript types', () => {
  it('BibleData has required fields', () => {
    const bible: BibleData = {
      characters: [],
      locations: [],
      objects: [],
      relations: [],
      vehicles: []
    };
    expect(bible.characters).toBeDefined();
  });
});
```

**YAML Load Test:**
```typescript
describe('loadYaml', () => {
  it('loads bible.yaml', async () => {
    const data = await loadYaml('bmad/data/bible.yaml');
    expect(data.characters).toBeDefined();
  });
  
  it('throws for missing file', async () => {
    await expect(loadYaml('missing.yaml')).rejects.toThrow();
  });
});
```

---

## Success Metrics

- [ ] 50+ TypeScript types defined
- [ ] 7 YAML files created
- [ ] YAML load/save works
- [ ] In-memory cache functional
- [ ] 15+ unit tests passing

---

## Example YAML (bible.yaml excerpt)

```yaml
# bmad/data/bible.yaml

characters:
  - id: jean_dupont
    name: Jean Dupont
    age_story_start: 42
    gender: male
    physical_description:
      height: 6ft
      eyes: brown
      hair: grey
    character_traits: [taciturn, loyal, impulsive]
    occupation: police inspector
    initial_status: alive
    first_appears: chapter_01
    voice:
      register: dry-casual
      tics: ["Yeah", "That's just how it is"]
      syntax: short sentences

locations:
  - id: bastille_precinct
    name: Bastille Police Precinct
    city: Paris
    district: 11th arrondissement
    description: 1970s building, damp basement
    initial_status: active
    first_appears: chapter_01
```

---

## Risks

| Risk | Mitigation |
|------|-----------|
| YAML parsing slow | Cache in memory, parse once |
| Type mismatches | Use Zod for runtime validation |
| File sync issues | Single source of truth (memory) |

---

**Ready for dev:** ✅ Yes (schemas documented)  
**Blocked by:** None
