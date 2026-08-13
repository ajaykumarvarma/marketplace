---
title: Database Schema & RLS Policies
status: in_progress
priority: urgent
type: feature
tags: [supabase, database, rls, schema]
created_by: agent
created_at: 2026-08-13T09:30:00Z
position: 12
---

## Notes
Create all marketplace database tables with proper foreign keys, indexes, and Row Level Security policies.

## Checklist
- [ ] Create `categories` table
- [ ] Create `products` table with seller FK
- [ ] Create `orders` table with buyer/seller FKs
- [ ] Create `order_items` table
- [ ] Create `reviews` table
- [ ] Create `fraud_logs` table
- [ ] Create `cart_items` table
- [ ] Enable RLS on all tables
- [ ] Create appropriate policies for each table
- [ ] Generate TypeScript types

## Acceptance
- All tables created with proper constraints
- RLS enabled with correct policies
- Types generated and imported