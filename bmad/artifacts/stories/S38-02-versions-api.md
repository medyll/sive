---
id: S38-02
sprint: 38
title: versions-api
status: done
---

# S38-02 — Versions API

## Goal
Create /api/versions endpoints for listing and restoring document versions.

## Acceptance Criteria
- [ ] GET /api/versions?docId= lists versions (id, createdAt, label, title preview)
- [ ] POST /api/versions/:id/restore restores a version (returns content+title)
- [ ] Auth-required

## Notes
src/routes/api/versions/+server.ts.
