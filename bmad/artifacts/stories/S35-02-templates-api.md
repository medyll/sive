---
id: S35-02
sprint: 35
title: templates-api
status: done
---

# S35-02 — Templates API

## Goal
Create /api/templates endpoints for listing, saving, and deleting templates.

## Acceptance Criteria
- [ ] GET /api/templates returns all (built-in + user)
- [ ] POST /api/templates saves custom template from current doc
- [ ] DELETE /api/templates/:id deletes user template
- [ ] Rate-limited, auth-required for write ops

## Notes
src/routes/api/templates/+server.ts.
