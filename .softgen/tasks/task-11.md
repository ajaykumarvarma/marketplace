---
title: Image Optimization & Loading States
status: in_progress
priority: medium
type: chore
tags: [performance, images, loading]
created_by: agent
created_at: 2026-08-12T09:44:00Z
position: 11
---

## Notes
Replace raw img tags with Next.js Image component where possible. Add skeleton loading states to all async data fetches and client-guarded components.

## Checklist
- [ ] Replace img tags with Next/Image on marketplace pages
- [ ] Add loading skeleton to product detail page
- [ ] Add loading skeleton to seller dashboard
- [ ] Add loading skeleton to admin dashboard
- [ ] Add skeleton to cart page client guard
- [ ] Verify images have width/height to prevent CLS

## Acceptance
- No raw img tags on main surfaces (marketplace, product detail)
- Skeleton loaders visible during data fetch
- No layout shift from image loading