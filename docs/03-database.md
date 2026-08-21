# TradeVault — Database Schema

**Database:** PostgreSQL (Supabase)
**RLS:** Row Level Security enabled on all tables

## Tables

### profiles
```sql
id uuid PRIMARY KEY REFERENCES auth.users(id)
full_name text
avatar_url text
role text DEFAULT 'buyer' -- buyer, seller, admin
verification_tier text DEFAULT 'bronze'
created_at timestamptz DEFAULT now()
```

### products
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
seller_id uuid REFERENCES profiles(id)
category_id uuid REFERENCES categories(id)
title text
description text
price numeric
original_price numeric
image_url text
delivery_time text
stock int DEFAULT 0
tags text[]
status text DEFAULT 'active'
created_at timestamptz DEFAULT now()
```

### categories
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text
slug text
description text
image_url text
created_at timestamptz DEFAULT now()
```

### orders
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
buyer_id uuid REFERENCES profiles(id)
seller_id uuid REFERENCES profiles(id) NOT NULL
product_id uuid REFERENCES products(id)
quantity int DEFAULT 1
total_amount numeric
delivery_method text
payment_method text
status text DEFAULT 'pending' -- pending, paid, delivered, completed, cancelled, disputed, payment_failed
device_fingerprint text
ip_address text
stripe_session_id text
stripe_payment_intent_id text
coupon_id uuid REFERENCES coupons(id)
discount_amount numeric DEFAULT 0
escrow_released boolean DEFAULT false
delivered_at timestamptz
followup_sent boolean DEFAULT false
created_at timestamptz DEFAULT now()
paid_at timestamptz
```

### order_files
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
order_id uuid REFERENCES orders(id)
product_id uuid REFERENCES products(id)
file_name text
file_path text
file_size int
content_type text
created_at timestamptz DEFAULT now()
```

### reviews
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
order_id uuid REFERENCES orders(id)
product_id uuid REFERENCES products(id)
reviewer_id uuid REFERENCES profiles(id)
seller_id uuid REFERENCES profiles(id)
rating int CHECK (rating >= 1 AND rating <= 5)
comment text
approved boolean DEFAULT true
helpful_count int DEFAULT 0
unhelpful_count int DEFAULT 0
created_at timestamptz DEFAULT now()
```

### review_votes
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
review_id uuid REFERENCES reviews(id)
user_id uuid REFERENCES profiles(id)
vote_type text CHECK (vote_type IN ('up', 'down'))
created_at timestamptz DEFAULT now()
UNIQUE(review_id, user_id)
```

### wishlists (or wishlist)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid REFERENCES profiles(id)
product_id uuid REFERENCES products(id)
created_at timestamptz DEFAULT now()
UNIQUE(user_id, product_id)
```

### notifications
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid REFERENCES profiles(id)
type text CHECK (type IN ('order', 'message', 'fraud', 'system', 'delivery'))
title text
message text
data jsonb
read boolean DEFAULT false
created_at timestamptz DEFAULT now()
```

### coupons
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
code text UNIQUE
discount_percent int
max_uses int
used_count int DEFAULT 0
expires_at timestamptz
active boolean DEFAULT true
created_at timestamptz DEFAULT now()
```

### fraud_logs
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid REFERENCES profiles(id)
event_type text
risk_score int
flags jsonb
ip_address text
device_fingerprint text
created_at timestamptz DEFAULT now()
```

### backups
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
file_name text
file_size bigint
file_path text
created_by uuid REFERENCES profiles(id)
created_at timestamptz DEFAULT now()
```

## Database Functions

### increment_coupon_usage(coupon_id uuid)
Increments `coupons.used_count` by 1.

### increment_review_counter(review_id uuid, counter_field text)
Increments or decrements `reviews.helpful_count` / `unhelpful_count`.

## RLS Policies

All tables have RLS enabled. Key patterns:

- **T1 (Private user data):** `profiles`, `wishlists`, `notifications` — users can only access their own rows
- **T2 (Public read, authenticated write):** `products`, `reviews` — anyone can read, authenticated users can write
- **T3 (Anonymous creation):** `contact_messages` — public insert

## Relationships

```
auth.users → profiles (1:1)
profiles → products (1:N)
profiles → orders as buyer (1:N)
profiles → orders as seller (1:N)
products → orders (1:N)
products → categories (N:1)
products → reviews (1:N)
orders → order_files (1:N)
orders → reviews (1:1)
reviews → review_votes (1:N)
profiles → wishlists (1:N)
profiles → notifications (1:N)
```