---
title: Authentication & Database Schema
status: todo
priority: urgent
type: feature
tags: [auth, supabase, database]
created_by: agent
created_at: 2026-08-09T15:06:00Z
position: 2
---

## Notes
Requires Supabase. Set up auth flows and database tables for users, profiles, products, orders, reviews, and fraud signals.

## Checklist
- [ ] Create Supabase client configuration
- [ ] Set up database tables: profiles, products, orders, order_items, reviews, fraud_logs, payouts
- [ ] Configure Row Level Security (RLS) policies
- [ ] Build login page with email/password and OAuth
- [ ] Build registration page with role selection (buyer/seller)
- [ ] Build password reset flow
- [ ] Create auth context/provider for session management
- [ ] Add protected route middleware/helpers

## Acceptance
- Users can register as buyer or seller
- Users can log in with email/password
- RLS policies prevent unauthorized data access
- Session persists across page reloads