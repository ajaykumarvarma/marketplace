---
title: Public REST API + Webhooks
status: done
priority: high
type: feature
tags: [api, webhooks, developer, rest]
created_by: agent
created_at: 2026-08-17T04:49:48Z
position: 36
---

## Notes
Public REST API with OAuth2-style API keys and webhook subscriptions for third-party integrations.

## Checklist
- [x] Create api_keys and webhooks tables
- [x] Build developer/api-keys.tsx page
- [x] Build developer/webhooks.tsx page
- [x] Build developer/index.tsx docs landing
- [x] Integrate into Navigation dropdown

## Acceptance
- API keys generate with rate limits (100 req/min)
- Webhooks deliver events reliably
- API docs explain all endpoints