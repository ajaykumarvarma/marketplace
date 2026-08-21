# TradeVault — Business Services

## authService.ts
Handles authentication operations:
- `signUp()` — Register new user with profile creation
- `signIn()` — Login with email/password
- `signOut()` — Logout and clear session
- `resetPassword()` — Send password reset email
- `updateProfile()` — Update user profile data

## fraudService.ts
Fraud detection and prevention:
- `checkFraudRisk()` — Calculate risk score (0-100) based on velocity, device, IP
- `getDeviceFingerprint()` — Generate browser fingerprint
- `getClientIP()` — Get client IP address
- `logFraudEvent()` — Record fraud event to database
- `recordFraudScore()` — Store fraud score for order

**Risk Factors:**
- Rapid purchase velocity (same user, multiple orders)
- New account + high value order
- Suspicious device fingerprint
- IP geolocation mismatch

**Actions:**
- Score < 40: Allow
- Score 40-69: Auto-hold (manual review)
- Score ≥ 70: Block transaction

## notificationService.ts
In-app notification creation:
- `createNotification()` — Insert notification into database
- Types: `order`, `message`, `fraud`, `system`, `delivery`

**Triggered by:**
- Stripe webhook (new order, payment confirmed)
- Order fulfillment (delivery confirmed)
- Review submission (new review received)

## rateLimiter.ts
IP-based rate limiting:
- `rateLimitByIP()` — Check if IP is within rate limits
- Used on: checkout, email, API endpoints

## Supabase Client
- `src/integrations/supabase/client.ts` — Browser client (uses anon key)
- `createClient()` in API routes — Server client (uses service role key)