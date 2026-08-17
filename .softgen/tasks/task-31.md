---
title: AI Fraud Detection Engine
status: in_progress
priority: urgent
type: feature
tags: [fraud, security, ai, risk-scoring]
created_by: agent
created_at: 2026-08-17T05:10:00Z
position: 31
---

## Notes
Behavioral scoring, velocity checks, device fingerprinting, automated holds with admin review queue.

## Checklist
- [ ] Create fraud_scores table
- [ ] Create fraud_alerts table
- [ ] Add velocity check service
- [ ] Add device fingerprinting
- [ ] Add risk scoring algorithm
- [ ] Add auto-hold on high risk
- [ ] Add admin review queue UI

## Acceptance
- Suspicious orders auto-flagged
- Admin sees review queue with risk scores
- False positive rate under 5%