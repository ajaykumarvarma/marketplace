# TradeVault — Environment Variables

## Frontend (Public)

These are exposed to the browser. **Never put secrets here.**

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abcdefgh12345678.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_SITE_URL` | Your production domain | `https://tradevault.io` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...` |

## Backend (Private)

These are **server-only**. Never prefix with `NEXT_PUBLIC_`.

| Variable | Purpose | Example |
|----------|---------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (bypasses RLS) | `eyJhbGciOiJIUzI1NiIs...` |
| `STRIPE_SECRET_KEY` | Stripe secret for API calls | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret | `whsec_...` |
| `RESEND_API_KEY` | Resend email API key | `re_...` |
| `SENTRY_DSN` | Error tracking DSN | `https://...@sentry.io/...` |

## Where to Set

### Local Development
Create `.env.local` in project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
SENTRY_DSN=https://...
```

### Production (Vercel)
Add via Vercel Dashboard → Project Settings → Environment Variables.

### Supabase Dashboard
Some auth settings (OAuth providers, email templates) are configured in Supabase Dashboard, not env vars.

## Important Notes

1. **Service Role Key** — This bypasses RLS. Only use it in server-side API routes. Never expose to client.
2. **Stripe Webhook Secret** — Required for webhook signature verification. Get it from Stripe Dashboard → Webhooks.
3. **Resend API Key** — Sign up at resend.com. Use a verified domain for `from` address.
4. **Sentry DSN** — Optional. Sign up at sentry.io for error monitoring.