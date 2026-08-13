-- Add verification_tier to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_tier text NOT NULL DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_secret text;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Create messages table for buyer-seller chat
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_participants" ON messages FOR ALL USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "seller_coupons" ON coupons FOR ALL USING (auth.uid() = seller_id);

-- Add auto_delivery and delivery_content to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS auto_delivery boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_content text;

-- Add risk_score and device_fingerprint to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS risk_score integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS device_fingerprint text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address text;

-- Add coupon_id to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0;

-- Add reported flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS reported boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS report_reason text;

-- Add platform analytics tracking table
CREATE TABLE IF NOT EXISTS platform_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_revenue numeric(12,2) NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  new_users integer NOT NULL DEFAULT 0,
  new_sellers integer NOT NULL DEFAULT 0,
  fraud_events integer NOT NULL DEFAULT 0,
  UNIQUE(date)
);