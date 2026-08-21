---
title: Promo Codes + Checkout Integration
status: in_progress
priority: high
type: feature
tags: [promo, checkout, stripe, payments]
created_by: agent
created_at: 2026-08-21T10:00:00Z
position: 1
---

## Notes
Promo code system with database schema, checkout UI, and Stripe coupon integration. Percentage and fixed-amount discounts.

## Checklist
- [ ] Create promo_codes table in Supabase
- [ ] Add promo code UI to checkout page
- [ ] Apply discount to order total
- [ ] Integrate with Stripe checkout session
- [ ] Add admin page to manage promo codes

## Acceptance
- User can enter promo code at checkout
- Discount is applied to order total
- Stripe session reflects the discount
- Invalid/expired codes show error