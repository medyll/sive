# Story S4-02 — Harden data types & stub store

**Epic:** Versioning
**Sprint:** Sprint 4
**Points:** 2
**Priority:** Must

## User Story

As a **developer**, I want a shared TypeScript module with Harden types and stub data, so that all versioning components can import consistent structures.

## Context

All versioning components (Timeline, Diff, Modal) share the same data shape. Define it once in `src/lib/harden.ts` with stub data for development.

## Acceptance Criteria

```gherkin
Given a developer imports from src/lib/harden.ts
When they use HardenSnapshot type
Then they get: id, label, timestamp, message, wordCount, diffFromPrevious fields

Given a developer imports STUB_HARDENS
When they iterate the array
Then they get at least 3 realistic entries

Given a developer imports hardenStore
When they call hardenStore.add(snapshot)
Then the reactive list updates and triggers re-render in consumers
```

## Technical Notes

- File: `src/lib/harden.ts`
- Types:
  ```ts
  interface HardenSnapshot {
    id: string;           // e.g. "h001"
    label: string;        // e.g. "incipit"
    timestamp: string;    // ISO 8601
    message: string;
    wordCount: number;
    diffFromPrevious?: {
      wordDelta: number;
      chaptersModified: string[];
      chaptersAdded: string[];
    };
  }
  interface HardenIndex { snapshots: HardenSnapshot[]; }
  ```
- `STUB_HARDENS`: 3 sample entries (realistic literary labels)
- `hardenStore`: Svelte 5 `$state`-based object with `snapshots` array + `add()` method

## Out of Scope

- File system read/write (`.harden/index.yaml`)

## Dependencies

- None

## Definition of Done

- [ ] Types exported from `src/lib/harden.ts`
- [ ] STUB_HARDENS has ≥ 3 entries
- [ ] hardenStore.add() pushes to reactive list
- [ ] TypeScript compilation clean
