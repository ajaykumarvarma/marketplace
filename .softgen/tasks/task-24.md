---
title: Real-Time Buyer-Seller Chat
status: in_progress
priority: high
type: feature
tags: [chat, messaging, realtime, supabase]
created_by: agent
created_at: 2026-08-17T04:37:00Z
position: 24
---

## Notes
Built-in messaging between buyers and sellers. Uses Supabase Realtime for instant message delivery. Supports read receipts, file attachments for dispute evidence, and message threading per order.

## Checklist
- [ ] Create chat_messages table with RLS (buyer/seller per order)
- [ ] Create ChatWindow component with message list and input
- [ ] Integrate chat into order detail page
- [ ] Add Supabase Realtime subscription for live messages
- [ ] Add read receipt tracking
- [ ] Add file attachment support for dispute evidence

## Acceptance
- Buyer and seller can exchange messages on an order
- Messages appear in real-time without refresh
- Messages are scoped to the specific order
- Unread count shows in UI