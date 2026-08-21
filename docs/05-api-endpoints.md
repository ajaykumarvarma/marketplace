# TradeVault — API Endpoints

## Stripe Payments

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/stripe/checkout-session` | Creates Stripe Checkout session, stores pending order |
| `POST` | `/api/stripe/webhook` | Handles `checkout.session.completed`, fulfills order, sends emails |

**Body (checkout-session):**
```json
{
  "items": [{ "id": "...", "title": "...", "price": 29.99, "quantity": 1, "seller": "..." }],
  "userId": "...",
  "email": "user@example.com",
  "deviceFingerprint": "...",
  "ipAddress": "...",
  "couponId": "optional-coupon-uuid",
  "discountPercent": 10
}
```

## Promo Codes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/validate-promo` | Validates coupon code, checks expiry/usage limits |

**Body:**
```json
{ "code": "SAVE20", "userId": "..." }
```

**Response:**
```json
{ "valid": true, "coupon": { "id": "...", "code": "SAVE20", "discount_percent": 20 } }
```

## Emails

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/send-email` | Sends transactional email via Resend |

**Template mode:**
```json
{
  "to": "user@example.com",
  "template": "order_confirmation",
  "props": { "buyerName": "...", "orderId": "...", "productTitle": "...", "amount": "$29.99", "orderUrl": "..." }
}
```

**Raw mode:**
```json
{
  "to": "user@example.com",
  "subject": "Hello",
  "html": "<h1>Hello</h1>"
}
```

## Reviews

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/reviews/vote` | Cast a vote (up/down) on a review |
| `DELETE` | `/api/reviews/vote` | Remove a vote |

**Body:**
```json
{ "reviewId": "...", "userId": "...", "voteType": "up" }
```

## Follow-Up Emails

| Method | Route | Description |
|--------|-------|-------------|
| `GET` / `POST` | `/api/follow-up-emails` | Cron endpoint — sends follow-up emails 3 days after delivery |

**Query param:** `?secret=your-cron-secret` (optional protection)

## Webhooks

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/webhooks/deliver` | Custom webhook delivery endpoint |

## Other

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/contact` | Contact form submission |
| `POST` | `/api/rate-limit` | Check rate limit status |
| `POST` | `/api/backup` | Create database backup |
| `GET` | `/api/backups/list` | List backups |
| `POST` | `/api/2fa/generate` | Generate 2FA secret |
| `POST` | `/api/2fa/verify` | Verify 2FA token |
| `POST` | `/api/products` | Server-side product listing (search, filter, pagination) |
| `POST` | `/api/send-email` | Generic email sender |
| `POST` | `/api/validate-promo` | Promo code validation |
| `POST` | `/api/follow-up-emails` | Scheduled follow-up email cron |

## Client-Side Data Access

Most data is fetched directly from Supabase using the client-side SDK:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Products
const { data } = await supabase.from("products").select("*").eq("status", "active");

// Orders
const { data } = await supabase.from("orders").select("*").eq("buyer_id", user.id);

// Reviews
const { data } = await supabase.from("reviews").select("*").eq("product_id", productId);
```

API routes are used for:
- Server-side operations (Stripe, Resend, backups)
- Operations requiring service role key
- Rate-limited endpoints
- Webhook handlers