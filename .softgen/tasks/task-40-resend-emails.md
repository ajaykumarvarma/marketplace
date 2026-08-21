---
title: Transactional Emails with Resend
status: todo
priority: high
type: feature
tags: [email, resend, notifications]
created_by: agent
created_at: 2026-08-21T09:42:00Z
position: 3
---

## Notes
Integrate Resend for transactional emails. Send order confirmations, delivery notifications, dispute updates, and seller alerts.

## Checklist
- [ ] Install resend SDK
- [ ] Create `/api/send-email` API route with Resend
- [ ] Create email service module with templates
- [ ] Send order confirmation email on successful payment
- [ ] Send delivery notification email when order is fulfilled
- [ ] Send dispute update emails
- [ ] Send seller alert emails for new orders
- [ ] Add RESEND_API_KEY to env config

## Acceptance
- Order confirmation email sent after Stripe payment
- Delivery email sent when seller fulfills order
- Dispute emails notify both parties
- Seller gets email alert for new orders
</checklist>