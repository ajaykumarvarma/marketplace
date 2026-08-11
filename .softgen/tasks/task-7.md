---
title: Cart, Checkout & Order Flow
status: done
priority: high
type: feature
tags: [cart, checkout, orders, payments]
created_by: agent
created_at: 2026-08-11T06:52:00Z
position: 7
---

## Notes
End-to-end buying flow: cart persistence, checkout with payment method selection, escrow confirmation, and order tracking.

## Checklist
- [x] Create CartContext with localStorage persistence
- [x] Create /cart page with quantity management and remove
- [x] Create /checkout page with card/crypto payment options
- [x] Add escrow protection messaging throughout
- [x] Wire cart count badge in Navigation
- [ ] Integrate real payment processor (Stripe/crypto)
- [ ] Wire orders to Supabase

## Acceptance
- Buyer can add items to cart from marketplace and product detail
- Cart persists across page reloads
- Buyer can proceed through checkout with payment method selection
- Order confirmation shows escrow protection details