# TradeVault — Platform Overview

**TradeVault** is a full-stack digital goods marketplace platform where sellers list digital products (game keys, software licenses, accounts, subscriptions) and buyers purchase them with escrow protection, fraud detection, and smooth UX.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (Page Router), React 19, TypeScript |
| Styling | Tailwind CSS 3.4, shadcn/ui components |
| Backend | Next.js API Routes (serverless), Supabase |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (email/password + OAuth) |
| Payments | Stripe Checkout |
| Email | Resend API + React Email templates |
| Storage | Supabase Storage (for delivery files) |
| Realtime | Supabase Realtime (notifications) |
| Monitoring | Sentry |

## Project Structure

```
src/
  pages/           # Next.js pages (routing)
  components/      # React components (UI, sections, features)
  contexts/        # React contexts (Auth, Cart, Theme)
  hooks/           # Custom hooks (toast, auth guard, keyboard shortcuts)
  services/        # Business logic (auth, fraud, notifications, rate limiter)
  lib/             # Utilities (utils, seed data)
  styles/          # Global CSS, Tailwind
  integrations/    # Supabase client + types
  emails/          # React Email templates
  types/           # TypeScript type declarations
```

## Key Design Decisions

1. **Serverless-first** — All backend logic runs in Next.js API routes, deployable to Vercel
2. **Supabase-native** — Auth, database, storage, and realtime all through Supabase
3. **Stripe for payments** — Checkout sessions handle payment collection, webhooks handle fulfillment
4. **React Email** — Type-safe, component-based email templates rendered server-side
5. **Fraud detection** — Client-side fingerprinting + server-side velocity checks