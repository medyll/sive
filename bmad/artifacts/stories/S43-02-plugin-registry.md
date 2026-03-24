---
id: S43-02
sprint: 43
title: plugin-registry
status: done
---

# S43-02 — pluginRegistry — Register/Unregister Plugins

## Goal
Reactive Svelte store acting as the central plugin registry.

## Acceptance Criteria
- [ ] register(manifest, module) adds plugin; throws if duplicate id
- [ ] unregister(id) removes plugin cleanly
- [ ] getAll() returns array of registered plugins
- [ ] getByPermission(permission) filters by permission type

## Notes
Registry at `src/lib/plugins/pluginRegistry.svelte.ts`.
