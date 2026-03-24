---
id: S43-06
sprint: 43
title: unit-tests-plugin-registry
status: done
---

# S43-06 — Unit Tests — pluginRegistry & Loader

## Goal
Unit tests covering registry CRUD operations and loader error resilience.

## Acceptance Criteria
- [ ] register() happy path and duplicate-id error tested
- [ ] unregister() removes plugin and is idempotent
- [ ] getByPermission() returns correct subset
- [ ] Loader logs error and continues when a plugin fails to import
- [ ] Loader registers successfully imported plugins

## Notes
Test files: `src/lib/plugins/pluginRegistry.spec.ts`, `src/lib/plugins/pluginLoader.spec.ts`.
