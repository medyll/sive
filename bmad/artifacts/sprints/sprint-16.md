# Sprint 16 — Document Sharing & Role-based Permissions

**Duration:** 2026-03-10 → 2026-03-24
**Capacity:** 18 story points

## Sprint Goal

Enable users to share documents with other registered users and enforce role-based access control (owner / editor / viewer), completing the collaborative writing feature set.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S16-01 | Collaboration | Document sharing data model | 3 | Must | — |
| S16-02 | Collaboration | Share invitation UI | 3 | Must | — |
| S16-03 | Collaboration | Role-based access control enforcement | 3 | Must | — |
| S16-04 | Collaboration | Collaborators panel UI | 3 | Should | — |
| S16-05 | QA | Unit tests — sharing & RBAC | 3 | Must | — |
| S16-06 | QA | E2E tests — sharing flow | 3 | Must | — |

**Total:** 18 points

## Dependencies

- Sprint 14 (WebSocket foundation) — done
- Sprint 15 (real-time integration) — done
- Existing auth: `src/lib/server/auth.ts`, `src/lib/server/db/auth.schema.ts`

## Status

✅ **SPRINT 16 COMPLETE**

- S16-01: ✅ Done (16 unit tests — shares data model)
- S16-02: ✅ Done (ShareModal + API endpoints + toolbar button)
- S16-03: ✅ Done (rbac.ts + enforced on page.server.ts)
- S16-04: ✅ Done (collaborator management in ShareModal)
- S16-05: ✅ Done (28 unit tests — shares + rbac)
- S16-06: ✅ Done (9 E2E tests — sharing flow)

## Definition of Done (sprint-level)

- [x] All Must stories completed and reviewed
- [x] Tests passing (unit + integration)
- [x] Documentation updated
- [ ] Deployed to staging

## Risks

- SQLite concurrent writes during share operations — mitigate with WAL mode (already enabled)
- Email invite flow depends on having SMTP configured — scope limited to in-app user lookup for MVP
