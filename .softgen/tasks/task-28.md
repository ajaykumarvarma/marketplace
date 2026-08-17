---
title: Sentry Error Tracking & Performance Monitoring
status: done
priority: high
type: feature
tags: [sentry, error-tracking, monitoring, performance]
created_by: agent
created_at: 2026-08-17T04:49:48Z
position: 28
---

## Notes
Real-time error tracking and performance monitoring with Sentry integration for Next.js.

## Checklist
- [x] Install @sentry/nextjs package
- [x] Create sentry.client.config.ts with browser instrumentation
- [x] Create sentry.server.config.ts and sentry.edge.config.ts
- [x] Add Sentry.ErrorBoundary to _app.tsx with custom fallback UI
- [x] Configure next.config.mjs with Sentry webpack plugin
- [x] Add environment variables for DSN and environment
- [x] Configure beforeSend to filter sensitive data

## Acceptance
- Errors are captured and sent to Sentry
- Performance traces include route changes and API calls
- Source maps are uploaded for readable stack traces
- No build errors from Sentry integration