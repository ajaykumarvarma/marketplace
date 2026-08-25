---
title: Price Drop Alerts
status: todo
priority: high
type: feature
tags: [price-alerts, email, wishlist]
created_by: agent
created_at: 2026-08-25T14:32:00Z
position: 3
---

## Notes
Buyers receive email notifications when wishlisted or watched products drop in price. Drives 15-25% of purchases on marketplaces.

## Checklist
- [ ] Create price_alerts table (user_id, product_id, target_price)
- [ ] Add "Notify when price drops" button to product page
- [ ] Cron job to check price changes daily
- [ ] Send email alert when price drops below target
- [ ] Show active alerts in user settings

## Acceptance
- Buyer can set price alert on any product
- Email sent when price drops to or below target
- Alerts can be managed in settings