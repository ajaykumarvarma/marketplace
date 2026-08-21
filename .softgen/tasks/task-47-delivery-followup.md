---
title: Scheduled Delivery Follow-Up Emails
status: in_progress
priority: high
type: feature
tags: [email, scheduling, orders]
created_by: agent
created_at: 2026-08-21T10:55:00Z
position: 1
---

## Notes
Automated email sent 3 days after product delivery to collect feedback.

## Checklist
- [ ] Add delivered_at and followup_sent to orders
- [ ] Create delivery follow-up API route
- [ ] Create React Email template for follow-up
- [ ] Set delivered_at on delivery confirmation
- [ ] Create cron endpoint to trigger follow-ups

## Acceptance
- Buyers receive email 3 days after delivery
- Email asks for feedback with link to review
- Each buyer only gets one follow-up per order