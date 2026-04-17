---
id: S43-04
sprint: 43
title: plugin-slot-component
status: done
---

# S43-04 — PluginSlot Component — Render Plugin Toolbar Items

## Goal
Generic PluginSlot component that renders registered plugin UI contributions for a given slot name.

## Acceptance Criteria
- [ ] Accepts `slot` prop (toolbar, sidebar, ai_tab)
- [ ] Renders each registered plugin's component for that slot
- [ ] Plugins rendered in registration order
- [ ] Empty slot renders nothing (no placeholder)

## Notes
Component at `src/lib/elements/PluginSlot.svelte`.
