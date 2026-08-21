---
title: Stripe Payments + Automated Order Fulfillment
status: in_progress
priority: urgent
type: feature
tags: [payments, stripe, orders, fulfillment]
created_by: agent
created_at: 2026-08-21T09:42:00Z
position: 1
---

## Notes
Integrate Stripe for real payment processing. On successful payment, create an order record and auto-deliver digital goods. Update checkout flow to redirect to Stripe Checkout.

## Checklist
- [ ] Install stripe SDK
- [ ] Create `/api/stripe/checkout-session` API route (creates Stripe session, stores order in DB)
- [ ] Create `/api/stripe/webhook` API route (handles checkout.session.completed)
- [ ] Update checkout page to redirect to Stripe Checkout instead of mock flow
- [ ] Update orders page to show real order data with delivery content
- [ ] Add Stripe webhook secret to env config
- [ ] Update order status flow: pending → paid → delivered → completed
- [ ] Auto-release escrow on delivery confirmation

## Acceptance
- Buyer can complete real payment via Stripe
- Order is created in database after payment
- Buyer can access delivery content in order detail
- Seller sees order in their dashboard
</checklist>