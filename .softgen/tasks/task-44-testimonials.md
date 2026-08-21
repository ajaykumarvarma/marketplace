---
title: Dynamic Testimonials from Database
status: done
priority: high
type: feature
tags: [landing, reviews, testimonials]
created_by: agent
created_at: 2026-08-21T10:49:00Z
position: 1
---

## Notes
Testimonials section on landing page pulls real reviews from the database.

## Checklist
- [x] Create TestimonialsSection component
- [x] Query reviews table via Supabase
- [x] Add carousel pagination
- [x] Add skeleton loading state
- [x] Wire into landing page

## Acceptance
- Landing page shows real buyer reviews
- Reviews rotate with pagination controls
- Works when no reviews exist (hidden)