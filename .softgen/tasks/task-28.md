---
title: Sentry Error Tracking & Performance Monitoring
status: in_progress
priority: high
type: feature
tags: [sentry, monitoring, errors, performance]
created_by: agent
created_at: 2026-08-17T04:53:38Z
position: 28
---

## Notes
Integrate Sentry for real-time error tracking, performance monitoring, and session replay across the Next.js application.

## Checklist
- [ ] Install @sentry/nextjs package
- [ ] Configure sentry.client.config.ts
- [ ] Configure sentry.server.config.ts
- [ ] Configure sentry.edge.config.ts
- [ ] Update next.config.mjs with Sentry webpack plugin
- [ ] Add ErrorBoundary wrapper in _app.tsx
- [ ] Add performance monitoring spans to key user flows
- [ ] Configure source maps upload

## Acceptance
- Errors are captured and sent to Sentry
- Performance transactions track page loads and API calls
- Source maps are uploaded for readable stack traces
- No build errors from Sentry integration