---
id: S29-03
sprint: 29
title: security-headers-csp
status: done
---

# S29-03 — Security Headers & CSP

## Goal
Add Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, HSTS, and Referrer-Policy headers.

## Acceptance Criteria
- [ ] CSP with img-src, script-src, style-src whitelisting
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Strict-Transport-Security: max-age=31536000
- [ ] Referrer-Policy: strict-origin-when-cross-origin

## Notes
Added to src/app.html or middleware.
