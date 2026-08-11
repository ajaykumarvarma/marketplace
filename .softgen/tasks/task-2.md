---
title: Authentication & Database Schema
status: done
priority: urgent
type: feature
tags: [auth, supabase, database]
created_by: agent
created_at: 2026-08-09T15:06:00Z
position: 2
---

## Notes
Frontend auth shell is complete. Supabase is NOT connected — database tables, RLS, and real sessions require backend integration.

## Checklist
- [x] Build login page with email/password UI and OAuth buttons
- [x] Build registration page with buyer/seller role selection
- [x] Build password reset / forgot-password page
- [x] Add rate-limiting UX (attempt counter, lockout timer)
- [x] Add security badges and trust signals on auth pages
- [ ] Create Supabase client configuration (BLOCKED — enable Supabase)
- [ ] Set up database tables: profiles, products, orders, order_items, reviews, fraud_logs, payouts (BLOCKED)
- [ ] Configure Row Level Security (RLS) policies (BLOCKED)
- [ ] Create auth context/provider for real session management (BLOCKED)
- [ ] Add protected route middleware/helpers (BLOCKED)

## Acceptance
- Users can register as buyer or seller
- Users can log in with email/password
- RLS policies prevent unauthorized data access
- Session persists across page reloads