---
title: Auto-Delivery System
status: in_progress
priority: urgent
type: feature
tags: [auto-delivery, digital-keys, scaling]
created_by: agent
created_at: 2026-08-25T14:32:00Z
position: 1
---

## Notes
Sellers upload digital keys/codes in bulk per product. Buyers receive instant automated delivery after payment — zero manual seller intervention. This is the #1 feature for marketplace scaling.

## Checklist
- [ ] Create product_stock table (product_id, key_code, sold, order_id)
- [ ] Add stock upload UI to product creation/edit
- [ ] Auto-deduct stock on successful payment
- [ ] Auto-deliver key to buyer via email + order page
- [ ] Mark stock as sold, link to order
- [ ] Show "In Stock: X keys" on product page
- [ ] Low stock warning to seller

## Acceptance
- Seller can upload 100+ keys at once for a product
- Buyer gets key instantly after Stripe payment
- Stock count decreases automatically
- Out-of-stock products are hidden or marked