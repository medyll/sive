# Sprint 78 — MCP Tools Foundation

**Status:** Planned  
**Target:** 3-4 jours  
**Priority:** P0 — Core AI architecture

---

## Context

**Problem:** MCP (Model Context Protocol) tools are the action layer between AI and data. Currently: **0 outils implémentés**.

**Spec Reference:** `bmad/references/project/5-ai-architecture-mcp-skills.md`

---

## Stories

### S78.01 — MCP Tools: Read Operations

**Goal:** Implement 5 read tools for accessing YAML data.

**Acceptance Criteria:**
- [ ] `readBible()` — Returns full bible.yaml content
- [ ] `readTimeline()` — Returns timeline.yaml content
- [ ] `readStructure()` — Returns structure.yaml content
- [ ] `readChapter(id)` — Returns chapter .md + .yaml
- [ ] `listChapters()` — Returns ordered chapter list
- [ ] All tools have unit tests
- [ ] Error handling for missing files

**Files to Create:**
- `src/lib/mcp/tools/read.ts` — Tool implementations
- `src/lib/mcp/tools/read.spec.ts` — 5+ tests
- `src/lib/mcp/types.ts` — Shared type definitions

**Estimated:** 6-8 hours

---

### S78.02 — MCP Tools: Write Operations

**Goal:** Implement 6 write tools for modifying YAML data.

**Acceptance Criteria:**
- [ ] `writeTransition(chapterId, transition)` — Adds transition to chapter.yaml
- [ ] `updateStatus(entityId, type, value)` — Updates bible entity status
- [ ] `addTimelineEvent(event)` — Adds event to timeline.yaml
- [ ] `addCharacter(data)` — Adds character to bible.yaml
- [ ] `updateNarrativeThread(id, data)` — Updates thread in structure.yaml
- [ ] `addMotifOccurrence(motifId, chapterRef, notes)` — Records motif in themes.yaml
- [ ] All tools persist to disk
- [ ] All tools have unit tests

**Files to Create:**
- `src/lib/mcp/tools/write.ts` — Tool implementations
- `src/lib/mcp/tools/write.spec.ts` — 6+ tests

**Estimated:** 8-10 hours

---

### S78.03 — MCP Tools: Analysis + Versioning

**Goal:** Implement analysis and versioning tools.

**Acceptance Criteria:**
- [ ] `compareVersions(idA, idB)` — Calculates diff between Hardens
- [ ] `extractChapterStates(id)` — Extracts entity states from chapter
- [ ] `countWords(scope)` — Counts words (chapter/volume/project)
- [ ] `searchOccurrences(term, scope)` — Finds term occurrences
- [ ] `createHarden(label, message)` — Creates version snapshot
- [ ] `restoreVersion(id)` — Restores Harden as current
- [ ] `readVersionIndex()` — Loads .harden/index.yaml
- [ ] All tools have unit tests

**Files to Create:**
- `src/lib/mcp/tools/analyse.ts` — Analysis tools
- `src/lib/mcp/tools/version.ts` — Versioning tools
- `src/lib/mcp/tools/analyse.spec.ts` — 4+ tests
- `src/lib/mcp/tools/version.spec.ts` — 3+ tests

**Estimated:** 8-10 hours

---

### S78.04 — MCP Tool Registry + Export

**Goal:** Central registry for all MCP tools with clean API.

**Acceptance Criteria:**
- [ ] `src/lib/mcp/index.ts` — Single export point
- [ ] Tools organized by category (read/write/analyse/version)
- [ ] TypeScript types for all tool signatures
- [ ] Documentation comments for each tool
- [ ] Error handling wrapper for all tools
- [ ] Tool execution logging

**Files to Create:**
- `src/lib/mcp/index.ts` — Main export
- `src/lib/mcp/registry.ts` — Tool registry
- `src/lib/mcp/logger.ts` — Execution logging

**Estimated:** 4-6 hours

---

## Dependencies

- ✅ YAML schemas documented (`4-intelligence-data.md`)
- ✅ Tool list specified (`5-ai-architecture-mcp-skills.md`)
- ❌ YAML files don't exist yet (created in S80)
- ❌ TypeScript types don't exist yet (created in S80)

**Note:** S78 can start with **mock YAML data** in memory. Real file I/O comes in S80.

---

## Test Strategy

**Mock Data:**
```typescript
// In tests, use in-memory YAML
const mockBible = {
  characters: [{ id: 'jean', name: 'Jean Dupont' }],
  locations: [{ id: 'precinct', name: 'Bastille Precinct' }]
};
```

**Test Pattern:**
```typescript
describe('readBible', () => {
  it('returns bible data', () => {
    const result = readBible();
    expect(result.characters).toBeDefined();
  });
  
  it('throws if file missing', () => {
    expect(() => readBible()).toThrow();
  });
});
```

---

## Success Metrics

- [ ] 20+ MCP tools implemented
- [ ] 20+ unit tests passing
- [ ] Tools callable from Skills (tested in S81)
- [ ] Zero TypeScript errors
- [ ] Documentation complete

---

## Risks

| Risk | Mitigation |
|------|-----------|
| File I/O complex in SvelteKit | Use in-memory first, disk I/O later |
| YAML parsing errors | Wrap in try/catch, return typed errors |
| Tool signatures unclear | Follow spec exactly, add JSDoc |

---

**Ready for dev:** ✅ Yes (spec complete)  
**Blocked by:** None (can use mock data)
