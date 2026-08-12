---
title: Image Optimization & Loading States
status: done
priority: medium
type: chore
tags: [performance, images, skeleton, nextjs]
created_by: agent
created_at: 2026-08-12T09:06:00Z
position: 11
---

## Notes
Implement Next.js Image optimization and add skeleton loading states for async data surfaces. Replace raw `<img>` tags and prevent layout shift.

## Checklist
- [x] Replace raw `<img>` with Next.js `<Image>` on marketplace cards
- [x] Replace raw `<img>` with Next.js `<Image>` on product detail
- [x] Add `sizes`, `priority`, and `loading` props appropriately
- [x] Add skeleton loader component for product cards
- [x] Add skeleton loader for product detail page
- [x] Simulate loading state on category change for UX demo
- [x] Ensure no layout shift from image loading

## Acceptance
- Next.js Image used on all product images (marketplace + product detail)
- Skeleton loaders visible during data fetch
- No layout shift from image loading