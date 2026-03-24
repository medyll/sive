---
id: S43-01
sprint: 43
title: plugin-manifest-schema
status: done
---

# S43-01 — Plugin Manifest Schema & TypeScript Types

## Goal
Define the PluginManifest TypeScript interface and a Zod validator for plugin descriptors.

## Acceptance Criteria
- [ ] PluginManifest interface: id, name, version, entry, permissions[]
- [ ] Zod schema validates required and optional fields
- [ ] Invalid manifests throw descriptive validation errors
- [ ] Types exported from `src/lib/plugins/types.ts`

## Notes
Permissions enum: toolbar, ai_tab, command, sidebar.
