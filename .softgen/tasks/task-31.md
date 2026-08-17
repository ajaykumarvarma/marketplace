---
title: AI Fraud Detection Engine
status: done
priority: urgent
type: feature
tags: [fraud, ai, security, risk-scoring]
created_by: agent
created_at: 2026-08-17T04:49:48Z
position: 31
---

## Notes
AI-powered fraud detection with behavioral scoring, velocity checks, and automated holds. Admin review queue for flagged transactions.

## Checklist
- [x] Create fraud_scores table with RLS
- [x] Build fraudService.ts with scoring algorithm
- [x] Create admin/fraud.tsx review queue UI
- [x] Integrate into checkout flow with auto-hold/block
- [x] Add device fingerprinting and IP tracking

## Acceptance
- Suspicious orders auto-flagged
- Admin sees review queue with risk scores
- False positive rate under 5%