# Story S5-03 — styleStore — reactive slider values

**Epic:** Style
**Sprint:** Sprint 5
**Points:** 2
**Priority:** Must

## User Story

As a **developer**, I want a shared reactive store for slider values so that they persist across tab switches and are accessible by future AI integration.

## Technical Notes

- Create `src/lib/styleStore.svelte.ts`
- Export `StyleValues` interface: `{ cynicism: number; complexity: number; rhythm: number; density: number }`
- Export `styleStore`: `$state`-based object with `values` + `set(key, value)` method
- Default: all values = 50

## Definition of Done

- [ ] `StyleValues` type exported
- [ ] `styleStore.values` is reactive `$state`
- [ ] `styleStore.set()` updates a single key
- [ ] TypeScript compilation clean
