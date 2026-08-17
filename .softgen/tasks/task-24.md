---
title: Real-Time Buyer-Seller Chat
status: done
priority: high
type: feature
tags: [chat, real-time, supabase, messaging]
created_by: agent
created_at: 2026-08-17T04:49:48Z
position: 24
---

## Notes
Real-time chat between buyer and seller per order. Uses Supabase Realtime for live message delivery.

## Checklist
- [x] Create ChatWindow component with Supabase Realtime subscription
- [x] Add message send/receive with read receipts
- [x] Integrate into orders/[id].tsx page
- [x] Add sender_id/receiver_id to messages table

## Acceptance
- Messages appear in real-time without refresh
- Messages are scoped to the specific order
- Unread count shows in UI