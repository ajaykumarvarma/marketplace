---
title: Public REST API + Webhooks
status: in_progress
priority: high
type: feature
tags: [api, rest, oauth, webhooks, developer]
created_by: agent
created_at: 2026-08-17T05:10:00Z
position: 36
---

## Notes
OAuth2 authentication, rate limits, webhook subscriptions for third-party integrations.

## Checklist
- [ ] Create api_keys table
- [ ] Create webhooks table
- [ ] Add OAuth2 middleware
- [ ] Add rate limiting per key
- [ ] Add webhook event delivery
- [ ] Add API documentation page

## Acceptance
- API keys generated per user
- Rate limits enforced (100 req/min)
- Webhooks deliver events reliably
- API docs explain all endpoints