---
title: Search Autocomplete / Suggestions
status: in_progress
priority: high
type: feature
tags: [search, ux, marketplace, conversion]
created_by: agent
created_at: 2026-09-04T02:01:00Z
position: 14
---

## Notes
Add real-time search suggestions dropdown to marketplace search. Debounced queries, product thumbnails, prices, and keyboard navigation.

## Checklist
- [ ] Create SearchAutocomplete component with debounced fetch
- [ ] Show product thumbnails, titles, prices in dropdown
- [ ] Keyboard navigation (arrow keys, enter, escape)
- [ ] Click suggestion to navigate to product
- [ ] Integrate into marketplace search bar

## Acceptance
- Typing in search shows suggestions within 300ms
- Arrow keys navigate suggestions
- Enter selects highlighted suggestion
- Clicking suggestion navigates to product detail