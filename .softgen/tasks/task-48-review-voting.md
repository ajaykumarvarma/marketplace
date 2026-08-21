---
title: Review Helpfulness Voting
status: todo
priority: high
type: feature
tags: [reviews, voting, ux]
created_by: agent
created_at: 2026-08-21T10:55:00Z
position: 2
---

## Notes
Users can rate whether reviews were helpful with thumbs up/down.

## Checklist
- [ ] Create review_votes table
- [ ] Add helpful_count/unhelpful_count to reviews
- [ ] Create vote API endpoint
- [ ] Add vote buttons to review cards
- [ ] Prevent duplicate votes per user

## Acceptance
- Users can upvote/downvote reviews
- Vote counts display on review cards
- One vote per user per review