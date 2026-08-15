---
title: axe-core Accessibility Tests
status: in_progress
priority: high
type: feature
tags: [accessibility, testing, axe-core]
created_by: agent
created_at: 2026-08-15T09:00:00Z
position: 21
---

## Notes
Add automated axe-core accessibility tests to the existing vitest test suite. Tests should cover key pages (landing, marketplace, auth, cart, checkout, seller dashboard, admin dashboard) and run on CI for continuous monitoring.

## Checklist
- [ ] Install axe-core and vitest-axe dependencies
- [ ] Create src/test/accessibility.test.tsx with page-level axe scans
- [ ] Add accessibility tests for landing page, marketplace, auth forms, cart, checkout
- [ ] Add CI-friendly reporter configuration
- [ ] Verify all tests pass with zero violations

## Acceptance
- `npm test` includes accessibility checks for at least 6 key pages
- Zero axe violations on tested pages
- Tests integrate cleanly with existing vitest suite