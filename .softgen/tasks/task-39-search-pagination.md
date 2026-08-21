---
title: Server-Side Search + Pagination
status: todo
priority: high
type: feature
tags: [search, pagination, performance]
created_by: agent
created_at: 2026-08-21T09:42:00Z
position: 2
---

## Notes
Replace client-side filtering with server-side search. Add pagination with URL-based params for shareable links. Use Supabase full-text search.

## Checklist
- [ ] Update `/api/products` to support server-side search, filter, sort, pagination
- [ ] Add URL-based search params (q, category, min, max, sort, page)
- [ ] Add pagination controls to marketplace page
- [ ] Add loading skeletons for search states
- [ ] Update SearchFilters to work with server-side params
- [ ] Add product count endpoint for pagination

## Acceptance
- Marketplace search is server-side with URL params
- Pagination shows correct page count
- Filters work with URL params for shareable links
- Search results load with skeleton states
</checklist>