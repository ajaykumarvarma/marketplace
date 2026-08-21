---
title: Scheduled Delivery Follow-Up Emails
status: done
priority: high
type: feature
tags: [email, follow-up, delivery]
created_by: agent
created_at: 2026-08-21T09:45:00Z
position: 1
---

## Notes
Automated follow-up emails sent 3 days after delivery to collect feedback.

## Checklist
- [x] Add delivered_at and followup_sent columns to orders
- [x] Create FollowUpEmail React Email template
- [x] Create /api/follow-up-emails.ts cron endpoint
- [x] Wire template to /api/send-email
- [x] Set delivered_at on buyer delivery confirmation

## Acceptance
- Follow-up email sent 3 days after delivery
- Email asks for feedback with link to review
- Each buyer only gets one follow-up per order