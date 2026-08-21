# TradeVault — Backend Migration Guide (Next.js → Python)

This guide outlines how to migrate the backend from Next.js API routes to a Python backend (FastAPI/Django/Flask) while keeping the Next.js frontend.

---

## 1. Architecture Changes

### Current (Next.js Full-Stack)
```
Browser → Next.js (Pages + API Routes) → Supabase (DB/Auth/Storage)
```

### Target (Python Backend + Next.js Frontend)
```
Browser → Next.js (Pages only) → Python API → Supabase (DB/Auth/Storage)
                ↓
           Static Export / ISR
```

---

## 2. Choose Your Python Framework

| Framework | Best For | Difficulty |
|-----------|----------|------------|
| **FastAPI** | Modern, async, auto-docs | Low |
| **Django + DRF** | Batteries-included, admin | Medium |
| **Flask** | Minimal, flexible | Medium |

**Recommendation:** FastAPI — easiest migration path from TypeScript, great async support, automatic OpenAPI docs.

---

## 3. Step-by-Step Migration

### Step 1: Set Up Python Project

```bash
mkdir tradevault-api
cd tradevault-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn supabase-py stripe python-resend pydantic
```

### Step 2: Create FastAPI App Structure

```
tradevault-api/
  main.py              # Entry point
  config.py            # Settings/env vars
  dependencies.py      # Auth, DB client injection
  routers/
    products.py        # /api/products
    orders.py          # /api/orders
    stripe.py          # /api/stripe/*
    reviews.py         # /api/reviews/*
    emails.py          # /api/send-email
    promo.py           # /api/validate-promo
    followup.py        # /api/follow-up-emails
  services/
    fraud.py           # Fraud detection logic
    notifications.py   # Notification creation
    rate_limiter.py    # Rate limiting
  templates/
    order_confirmation.html
    seller_notification.html
  supabase_client.py   # Supabase client setup
```

### Step 3: Migrate Each API Route

#### Example: `/api/products` (GET)

**Current (Next.js):**
```typescript
// src/pages/api/products/index.ts
const { data } = await supabaseAdmin
  .from("products")
  .select("*, seller:seller_id(full_name, role), category:category_id(name)")
  .eq("status", "active")
  .range(offset, offset + limit - 1);
```

**Python (FastAPI):**
```python
# routers/products.py
from fastapi import APIRouter, Query
from supabase_client import supabase_admin

router = APIRouter()

@router.get("/api/products")
async def list_products(
    search: str = Query(None),
    category: str = Query(None),
    sort: str = Query("featured"),
    limit: int = Query(18),
    offset: int = Query(0),
):
    query = supabase_admin.table("products").select(
        "*, seller:seller_id(full_name, role), category:category_id(name)"
    ).eq("status", "active")
    
    if category:
        query = query.eq("category.name", category)
    if search:
        query = query.ilike("title", f"%{search}%")
    
    # Sorting logic...
    query = query.range(offset, offset + limit - 1)
    
    response = query.execute()
    return {"products": response.data, "total": len(response.data)}
```

#### Example: `/api/stripe/checkout-session` (POST)

**Python (FastAPI):**
```python
# routers/stripe.py
import stripe
from fastapi import APIRouter, Request, HTTPException

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/api/stripe/checkout-session")
async def create_checkout_session(request: Request):
    body = await request.json()
    
    # Validate request
    # Build line items
    # Create Stripe session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[...],
        mode="payment",
        success_url="...",
        cancel_url="...",
    )
    
    # Store pending orders in Supabase
    # ...
    
    return {"sessionId": session.id, "url": session.url}
```

#### Example: `/api/stripe/webhook` (POST)

**Python (FastAPI):**
```python
@router.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # Update order status
        # Send emails via Resend
        # Create notifications
    
    return {"received": True}
```

### Step 4: Migrate Services

#### Fraud Service

**Current (TypeScript):**
```typescript
// src/services/fraudService.ts
export async function checkFraudRisk(userId: string, amount: number, deviceFingerprint: string) {
  // Velocity check
  // Risk scoring
  return { score, decision, factors };
}
```

**Python:**
```python
# services/fraud.py
from supabase_client import supabase_admin

async def check_fraud_risk(user_id: str, amount: float, device_fingerprint: str):
    # Check recent orders
    recent_orders = supabase_admin.table("orders")\
        .select("*")\
        .eq("buyer_id", user_id)\
        .gte("created_at", (datetime.now() - timedelta(hours=24)).isoformat())\
        .execute()
    
    score = 0
    factors = []
    
    if len(recent_orders.data) > 3:
        score += 30
        factors.append({"reason": "High purchase velocity"})
    
    # Add more checks...
    
    decision = "allow"
    if score >= 70:
        decision = "block"
    elif score >= 40:
        decision = "hold"
    
    return {"score": score, "decision": decision, "factors": factors}
```

#### Email Service (Resend)

**Python:**
```python
# services/emails.py
import resend
from jinja2 import Template

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_order_confirmation(to: str, buyer_name: str, order_id: str, product_title: str, amount: str):
    with open("templates/order_confirmation.html") as f:
        template = Template(f.read())
    
    html = template.render(
        buyer_name=buyer_name,
        order_id=order_id,
        product_title=product_title,
        amount=amount
    )
    
    resend.Emails.send({
        "from": "TradeVault <noreply@tradevault.io>",
        "to": to,
        "subject": f"Payment Confirmed — Order #{order_id}",
        "html": html
    })
```

> **Note:** React Email templates are JSX components. For Python, convert to Jinja2 templates or use HTML strings. Alternatively, keep a Node.js microservice just for email rendering.

### Step 5: Update Frontend

Change all API calls from relative paths to your Python backend URL:

**Current:**
```typescript
const res = await fetch("/api/stripe/checkout-session", { ... });
```

**After Migration:**
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/checkout-session`, { ... });
```

Or use a proxy in `next.config.js`:
```javascript
module.exports = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "https://api.tradevault.io/api/:path*" }
    ];
  }
};
```

### Step 6: Auth Migration

**Current:** Supabase Auth handles everything (client + server).

**After Migration:**
- Keep Supabase Auth for frontend session management
- Python backend verifies JWT tokens from Supabase:
```python
from supabase_py import create_client

supabase = create_client(url, key)

async def get_current_user(token: str = Header(...)):
    user = supabase.auth.api.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
```

---

## 4. Environment Variables (Python)

Create `.env` in Python project:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# App
API_URL=https://api.tradevault.io
FRONTEND_URL=https://tradevault.io
```

---

## 5. Deployment

### Python Backend
- **Option A:** Docker + AWS/GCP/Azure
- **Option B:** Railway/Render/Fly.io (easiest)
- **Option C:** AWS Lambda + API Gateway (serverless)

**Example Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Next.js Frontend
- Deploy to Vercel as before
- Update environment variables to point to Python API

---

## 6. What Stays in Next.js

Even after migration, keep these in Next.js:

| Feature | Reason |
|---------|--------|
| **Pages/Routing** | Next.js is your frontend framework |
| **React Email** | JSX templates need Node.js runtime |
| **SEO/JSON-LD** | Server-side rendering for crawlers |
| **Static Generation** | `getStaticProps` for performance |
| **Image Optimization** | Next.js Image component |

---

## 7. Common Pitfalls

1. **Type Safety** — Python is dynamically typed. Use Pydantic models to maintain type safety:
```python
from pydantic import BaseModel

class CheckoutRequest(BaseModel):
    items: list[dict]
    userId: str
    email: str
    couponId: str | None = None
```

2. **Async/Await** — FastAPI is async-native. Use `await` for all IO operations (DB, HTTP, file).

3. **Stripe Webhooks** — Webhook endpoints must return quickly. Use background tasks:
```python
from fastapi import BackgroundTasks

@router.post("/api/stripe/webhook")
async def webhook(request: Request, background: BackgroundTasks):
    background.add_task(process_webhook, payload)
    return {"received": True}
```

4. **CORS** — Enable CORS for your frontend domain:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tradevault.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

5. **Database Migrations** — Keep using Supabase migrations. Don't use Django/Flask migrations unless you move away from Supabase.

---

## 8. Migration Checklist

- [ ] Set up Python project (FastAPI + dependencies)
- [ ] Migrate `/api/products` → Python router
- [ ] Migrate `/api/stripe/*` → Python router
- [ ] Migrate `/api/send-email` → Python service
- [ ] Migrate `/api/validate-promo` → Python router
- [ ] Migrate `/api/reviews/vote` → Python router
- [ ] Migrate `/api/follow-up-emails` → Python cron job
- [ ] Migrate `fraudService.ts` → Python service
- [ ] Migrate `notificationService.ts` → Python service
- [ ] Convert React Email templates → Jinja2/HTML
- [ ] Update frontend API base URL
- [ ] Test all endpoints
- [ ] Deploy Python backend
- [ ] Update Vercel env vars
- [ ] Monitor errors (Sentry)

---

## 9. Recommended Python Stack

```txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
supabase==2.3.0
stripe==8.0.0
resend==1.0.0
pydantic==2.6.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
httpx==0.26.0
celery==5.3.0          # For background tasks
redis==5.0.0           # For Celery broker
jinja2==3.1.0          # For email templates
pytest==8.0.0          # For testing
```

---

## 10. Time Estimate

| Phase | Effort |
|-------|--------|
| Setup + scaffolding | 1 day |
| Migrate API routes | 3-5 days |
| Migrate services | 2-3 days |
| Email templates | 1 day |
| Testing | 2-3 days |
| Deployment | 1 day |
| **Total** | **10-14 days** |

---

## Summary

Migrating to Python gives you:
- ✅ True backend separation (frontend can be static)
- ✅ More mature async ecosystem (Celery, Redis, etc.)
- ✅ Easier scaling of backend independently
- ✅ Python ML libraries for advanced fraud detection

Trade-offs:
- ⚠️ Losing Next.js API route simplicity
- ⚠️ Need to manage separate deployment
- ⚠️ React Email templates need conversion
- ⚠️ More infrastructure to maintain