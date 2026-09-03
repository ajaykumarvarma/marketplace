---
title: Recently Viewed Products
status: done
priority: high
type: feature
tags: [conversion, ux, localStorage]
created_by: agent
created_at: 2026-09-03T10:34:00Z
position: 11
---

## Notes
Track products user has viewed via localStorage. Display horizontally scrollable section on marketplace and product detail pages.

## Checklist
- [x] Add useRecentlyViewed hook with localStorage persistence
- [x] Track product view on marketplace/[id].tsx mount
- [x] Add RecentlyViewed component with horizontal scroll
- [x] Display on marketplace index page
- [x] Limit to 12 items, deduplicate

## Acceptance
- User sees last 12 viewed products on marketplace
- Products persist across sessions
- Clicking a recent product navigates to detail page