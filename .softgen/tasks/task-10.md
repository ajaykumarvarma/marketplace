---
title: Test Suite — Auth & Checkout Flows
status: done
priority: high
type: chore
tags: [testing, auth, checkout, vitest]
created_by: agent
created_at: 2026-08-12T09:06:00Z
position: 10
---

## Notes
Create basic test suite covering critical user auth and checkout flows using Vitest and React Testing Library.

## Checklist
- [x] Set up Vitest configuration with React plugin and jsdom
- [x] Create test setup file with jest-dom matchers
- [x] Write auth tests (login form, password toggle, register link)
- [x] Write cart tests (add item, remove item, update quantity, empty state)
- [x] Write checkout tests (render, empty cart state, payment options, order summary)
- [x] Write 404 tests (heading, links, dark theme)
- [x] Pre-seed cart data for checkout tests
- [x] Mock next/router where needed

## Acceptance
- All tests pass with `npm test`
- Coverage includes auth validation and cart operations