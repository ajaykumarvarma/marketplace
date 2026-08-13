---
title: Cart & Orders Data Layer
status: todo
priority: high
type: feature
tags: [cart, orders, checkout, supabase]
created_by: agent
created_at: 2026-08-13T09:30:00Z
position: 15
---

## Notes
Replace localStorage cart with Supabase cart_items. Wire checkout, order history, and order detail to live data.

## Checklist
- [ ] Replace localStorage cart with Supabase cart_items
- [ ] Wire checkout to create real orders
- [ ] Wire orders index to fetch buyer's orders
- [ ] Wire order detail to fetch order data
- [ ] Add order status update flow
- [ ] Wire seller orders to real data

## Acceptance
- Cart persists in database per user
- Checkout creates real orders
- Order history shows live data
- Order status updates work