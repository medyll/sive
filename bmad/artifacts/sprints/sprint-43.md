# Sprint 43 — Plugin System Foundation

**Sprint Duration:** 2026-03-17 → 2026-03-21
**Status:** ✅ Done
**Goal:** Establish a lightweight plugin registry that allows first-party and future third-party extensions to register toolbar actions, commands, and AI panel tabs.

---

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---:|---|---|
| S43-01 | Plugins | Plugin manifest schema & TypeScript types | 2 | Must |
| S43-02 | Plugins | pluginRegistry — register/unregister plugins | 3 | Must |
| S43-03 | Plugins | Plugin loader — dynamic import on app boot | 3 | Must |
| S43-04 | Plugins | PluginSlot component — render plugin toolbar items | 3 | Must |
| S43-05 | Plugins | Built-in word-count plugin (reference implementation) | 2 | Should |
| S43-06 | Testing | Unit tests — pluginRegistry & loader | 2 | Should |

**Total:** 15 points

---

## Acceptance Criteria
- [x] Plugin manifest validates required fields (id, name, version, entry)
- [x] pluginRegistry exposes register(), unregister(), getAll()
- [x] Plugins loaded from `src/lib/plugins/` on app init
- [x] PluginSlot renders registered toolbar items in correct order
- [x] Word-count plugin adds a live counter to the toolbar
- [x] Unit tests cover registry CRUD and loader error handling
