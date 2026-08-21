---
title: Promo Codes + Checkout Integration
status: done
priority: high
type: feature
tags: [promo, coupons, checkout, stripe]
created_by: agent
created_at: 2026-08-21T09:45:00Z
position: 1
---

## Notes
Promo code system with database validation, checkout UI, and Stripe integration.

## Checklist
- [x] Create /api/validate-promo endpoint
- [x] Add promo code input to checkout page
- [x] Apply discount to order total
- [x] Stripe session reflects the discount
- [x] Invalid/expired codes show error

## Acceptance
- Users can enter and apply promo codes at checkout
- Valid codes reduce order total by discount_percent
- Invalid/expired/used codes show clear error messages