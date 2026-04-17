# Sprint 17 — Test Suite Hardening & GitHub OAuth

**Duration:** 2026-03-10 → 2026-03-24
**Capacity:** 18 story points

## Sprint Goal

Eliminate all pre-existing test failures, add GitHub OAuth as the PRD "Should" social login provider, and surface shared documents in the document list.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S17-01 | QA | Fix 5 pre-existing test failures | 3 | Must | — |
| S17-02 | Auth | GitHub OAuth integration | 3 | Should | — |
| S17-03 | Collaboration | Show shared documents in document list | 3 | Should | — |
| S17-04 | Auth | User profile: display name & avatar | 2 | Could | — |
| S17-05 | QA | Unit tests — OAuth + shared docs | 3 | Must | — |
| S17-06 | QA | E2E tests — OAuth flow + shared docs UI | 3 | Must | — |

**Total:** 17 points

## Dependencies

- Sprint 16 (RBAC + document_shares) — done
- Better-Auth GitHub provider config
- GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars

## Definition of Done (sprint-level)

- [ ] Zero test failures in the test suite (was 5)
- [ ] GitHub OAuth login functional in dev
- [ ] Shared documents visible in document list
- [ ] Tests passing (unit + E2E)

## Risks

- GitHub OAuth requires app registration; use stub/mock in CI
