---
title: Seller Subscription Tiers
status: done
priority: high
type: feature
tags: [subscriptions, billing, seller, stripe]
created_by: agent
created_at: 2026-08-17T04:49:48Z
position: 33
---

## Notes
Free, Basic, and Pro subscription tiers for sellers with commission differences and feature gating.

## Checklist
- [x] Create seller_subscriptions table
- [x] Build seller/subscription.tsx page
- [x] Add tier comparison cards (Free/Basic/Pro)
- [x] Integrate Stripe billing flow

## Acceptance
- Sellers can upgrade/downgrade plans
- Features gated by active subscription
- Commission calculated by tier