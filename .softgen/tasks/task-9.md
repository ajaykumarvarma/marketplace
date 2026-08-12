---
title: Responsive Audit — Dashboards & Checkout
status: in_progress
priority: high
type: chore
tags: [responsive, css, dashboard, checkout]
created_by: agent
created_at: 2026-08-12T09:44:00Z
position: 9
---

## Notes
Audit all dashboard and checkout pages for mobile/tablet breakpoints. Fix overflow, cramped layouts, hidden elements, and touch targets below 44px.

## Checklist
- [ ] Audit seller dashboard responsiveness (tabs, tables, cards)
- [ ] Audit admin dashboard responsiveness (fraud alerts, tables)
- [ ] Audit checkout page responsiveness (form layout, summary sticky)
- [ ] Audit cart page responsiveness (item rows, quantity controls)
- [ ] Fix any overflow-x on tables
- [ ] Ensure touch targets ≥ 44px on mobile
- [ ] Verify sticky sidebars don't break mobile scroll

## Acceptance
- All dashboard pages usable on 375px width
- Checkout flows complete on mobile without horizontal scroll
- Tables scroll horizontally when needed with visible scroll hints