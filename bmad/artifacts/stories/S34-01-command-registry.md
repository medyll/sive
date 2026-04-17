---
id: S34-01
sprint: 34
title: command-registry
status: done
---

# S34-01 — Command Registry

## Goal
Create commandRegistry.ts with static commands across navigation/document/ai/settings/view categories and fuzzy search.

## Acceptance Criteria
- [ ] Command type: { id, label, keywords[], category, icon?, action, shortcut? }
- [ ] Static commands for all 5 categories registered at startup
- [ ] registerCommand() / unregisterCommand() for dynamic commands
- [ ] searchCommands(query) fuzzy match ranked by relevance

## Notes
src/lib/commandRegistry.ts.
