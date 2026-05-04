# S92-01 — Update Vulnerable Dependencies

**Sprint:** 92 — Security & Stabilité
**Priority:** 🔴 CRITIQUE
**Effort:** 15 min
**Assignee:** Dev

## Context

External audit (AUDIT.md, 2026-05-03) identified 4 HIGH vulnerabilities:
- `flatted` <=3.4.1 → Prototype Pollution (DoS)
- `kysely` <=0.28.13 → SQL Injection (MySQL path)
- `kysely` >=0.26.0 <=0.28.11 → SQL Injection (JSON path keys)
- `picomatch` → ReDoS via extglob

Note: Sive uses SQLite (not MySQL), so Kysely SQL injection impact is limited. Still required.

## Acceptance Criteria

- [ ] `flatted` updated to >=3.4.2
- [ ] `kysely` updated to >=0.28.14
- [ ] `pnpm audit` returns 0 HIGH vulnerabilities
- [ ] All existing tests pass after update

## Implementation

```bash
pnpm up flatted@^3.4.2 kysely@^0.28.14
pnpm audit --fix
pnpm install
npm run test
```

## Test

Run `pnpm audit` — must show 0 HIGH vulnerabilities.
Run `npm run test` — must pass.
