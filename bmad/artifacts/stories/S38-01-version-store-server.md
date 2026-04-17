---
id: S38-01
sprint: 38
title: version-store-server
status: done
---

# S38-01 — Version Store (Server)

## Goal
Create versions.ts server store with in-memory Map, FIFO eviction at 50 versions, and CRUD operations.

## Acceptance Criteria
- [ ] Version type: { id, docId, userId, content, title, createdAt, label? }
- [ ] Map<docId, Version[]>, max 50 per doc (FIFO eviction)
- [ ] saveVersion, getVersions, getVersion, restoreVersion implemented

## Notes
src/lib/server/versions.ts.
