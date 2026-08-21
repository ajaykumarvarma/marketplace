---
title: Review Helpfulness Voting
status: done
priority: high
type: feature
tags: [reviews, voting, ux]
created_by: agent
created_at: 2026-08-21T09:45:00Z
position: 2
---

## Notes
Thumbs up/down system for users to rate review helpfulness.

## Checklist
- [x] Create review_votes table with RLS
- [x] Create /api/reviews/vote.ts endpoint
- [x] Add vote buttons to marketplace product detail
- [x] Add vote buttons to seller profile reviews
- [x] Show helpful/unhelpful counts

## Acceptance
- Users can upvote/downvote reviews
- Vote counts display on review cards
- One vote per user per review