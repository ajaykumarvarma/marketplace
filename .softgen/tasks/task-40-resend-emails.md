---
title: Transactional Emails with Resend
status: done
priority: high
type: feature
tags: [email, resend, notifications]
created_by: agent
created_at: 2026-08-21T09:45:00Z
position: 3
---

## Notes
Resend API integration for transactional emails. Order confirmations, seller alerts, dispute notifications. Rate limited per IP.

## Checklist
- [x] Create /api/send-email route with Resend
- [x] Add email triggers to Stripe webhook
- [x] Send order confirmation to buyer
- [x] Send new order alert to seller
- [x] Add rate limiting to email endpoint

## Acceptance
- Buyer receives order confirmation email after payment
- Seller receives email alert for new orders
