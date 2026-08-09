# TradeVault — Digital Goods Marketplace

## Vision
A secure, high-trust marketplace where digital goods sellers and buyers transact with fraud protection, escrow, and seamless UX. Think Sellix meets U7buy, but with the visual authority of a secure trading terminal.

## Design
- **Evocation:** Industrial Vault — secure trading terminal, engineering precision
- **Emotional signature:** Calm authority with understated opulence; every pixel signals "your funds are safe here"
- **Palette:**
  - `--background: 210 25% 5%` (#0B0F14) — deep graphite void
  - `--foreground: 210 15% 93%` (#E8ECF1) — cool white
  - `--card: 213 24% 9%` (#111820) — elevated surface
  - `--muted: 213 24% 14%` (#1C2430) — subtle separation
  - `--primary: 213 50% 57%` (#5B8EC8) — steel blue, the trust signal
  - `--accent: 177 60% 54%` (#3DD6D0) — data cyan, action highlights
  - `--border: 213 24% 18%` (#232D3B) — faint structure
  - `--destructive: 0 65% 62%` (#E05D5D)
  - `--success: 142 69% 62%` (#4ADE80)
  - `--warning: 45 97% 56%` (#FBBF24)
- **Typography:**
  - Display/Headings: `Space Grotesk` → wait, that's on the reject list. Using `Sora` for headlines (geometric, precise)
  - Body: `IBM Plex Sans` (engineered, readable)
  - Data/Numbers: `JetBrains Mono` (tabular nums for prices, order IDs)
- **Style direction:** Dense data surfaces with generous whitespace on marketing pages. Sharp corners on data cards (0-4px), subtle borders over shadows. Single accent hit (cyan) on primary CTAs and trust badges.

## Features
- **Landing:** SEO-optimized hero, category browsing, top sellers, trust signals, live stats ticker
- **Auth:** Email/password + OAuth (Supabase Auth), role-based (buyer/seller/admin)
- **Seller Dashboard:** Product management, order fulfillment, analytics, payout requests
- **Buyer Marketplace:** Search/filter/browse, product detail, cart, checkout with escrow
- **Order System:** Status tracking, delivery confirmation, dispute resolution
- **Reviews:** Post-purchase ratings and feedback
- **Fraud Detection:** Velocity checks, risk scoring, automated holds, admin review queue
- **Admin Panel:** User management, fraud alerts, platform analytics, moderation