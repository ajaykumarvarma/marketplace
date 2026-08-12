---
title: Test Suite — Auth & Checkout Flows
status: in_progress
priority: high
type: chore
tags: [testing, auth, checkout]
created_by: agent
created_at: 2026-08-12T09:44:00Z
position: 10
---

## Notes
Basic test coverage for critical user paths using Vitest + React Testing Library (already in template).

## Checklist
- [ ] Test auth form validation (email format, password length)
- [ ] Test auth rate limiting logic (attempt counter, lockout)
- [ ] Test cart context (add, remove, update quantity, persistence)
- [ ] Test checkout form validation (required fields)
- [ ] Test 404 page renders

## Acceptance
- Tests run with `npm test` and pass
- Coverage includes auth validation and cart operations