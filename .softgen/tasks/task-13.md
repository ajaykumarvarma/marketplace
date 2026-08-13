---
title: Real Auth Sessions
status: todo
priority: urgent
type: feature
tags: [auth, supabase, sessions]
created_by: agent
created_at: 2026-08-13T09:30:00Z
position: 13
---

## Notes
Replace mock auth with real Supabase Auth sessions. Update login/register pages, add auth context, and protect routes.

## Checklist
- [ ] Create auth context with session management
- [ ] Wire login page to `supabase.auth.signInWithPassword`
- [ ] Wire register page to `supabase.auth.signUp`
- [ ] Wire forgot-password to `supabase.auth.resetPasswordForEmail`
- [ ] Add logout functionality
- [ ] Add session listener for auth state changes
- [ ] Protect seller/admin routes
- [ ] Update Navigation to show auth state

## Acceptance
- Users can register and log in with real sessions
- Session persists across page reloads
- Logout clears session
- Protected routes redirect unauthenticated users