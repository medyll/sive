---
id: S43-03
sprint: 43
title: plugin-loader
status: done
---

# S43-03 — Plugin Loader — Dynamic Import on App Boot

## Goal
Boot-time loader that discovers and dynamically imports plugin modules from `src/lib/plugins/`.

## Acceptance Criteria
- [ ] Loader scans for `*.plugin.ts` files matching a glob
- [ ] Each plugin module exports a default PluginManifest
- [ ] Failed plugin loads are caught and logged; app continues
- [ ] Loader called once in `+layout.ts` onMount

## Notes
Loader at `src/lib/plugins/pluginLoader.ts`.
