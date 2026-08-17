-- ===== FEATURE 31: AI Fraud Detection =====
CREATE TABLE IF NOT EXISTS fraud_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  decision text NOT NULL DEFAULT 'allow' CHECK (decision IN ('allow', 'review', 'block')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('velocity', 'device', 'behavior', 'manual')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'false_positive')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== FEATURE 33: Seller Subscription Tiers =====
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_yearly numeric(10,2) NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 10.00,
  max_products integer NOT NULL DEFAULT 10,
  featured_listing boolean NOT NULL DEFAULT false,
  analytics_advanced boolean NOT NULL DEFAULT false,
  custom_branding boolean NOT NULL DEFAULT false,
  priority_support boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seller_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== FEATURE 34: Referral System =====
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  commission_earned numeric(12,2) NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 5.00,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code text NOT NULL,
  signup_at timestamptz,
  first_order_at timestamptz,
  commission_amount numeric(12,2) NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== FEATURE 35: Notification Preferences =====
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'push', 'sms')),
  category text NOT NULL CHECK (category IN ('orders', 'messages', 'fraud', 'marketing', 'system')),
  enabled boolean NOT NULL DEFAULT true,
  frequency text NOT NULL DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'never')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel, category)
);

-- ===== FEATURE 36: API Keys & Webhooks =====
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  permissions text[] NOT NULL DEFAULT '{}'::text[],
  rate_limit integer NOT NULL DEFAULT 100,
  last_used_at timestamptz,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT '{}'::text[],
  active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  last_status integer,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, commission_rate, max_products, featured_listing, analytics_advanced, custom_branding, priority_support) VALUES
('Free', 'free', 'Get started selling with basic features', 0, 0, 15.00, 10, false, false, false, false),
('Basic', 'basic', 'Grow your store with more products and lower fees', 9.99, 99.99, 10.00, 50, false, false, false, false),
('Pro', 'pro', 'Maximize your sales with premium features', 29.99, 299.99, 5.00, 999, true, true, true, true)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE fraud_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- fraud_scores: admin only
CREATE POLICY "fraud_scores_admin" ON fraud_scores FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- fraud_alerts: admin full access, involved users read
CREATE POLICY "fraud_alerts_admin" ON fraud_alerts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "fraud_alerts_user_read" ON fraud_alerts FOR SELECT USING (user_id = auth.uid());

-- subscription_plans: public read
CREATE POLICY "subscription_plans_public" ON subscription_plans FOR SELECT USING (true);

-- seller_subscriptions: owner read/update, admin all
CREATE POLICY "seller_subscriptions_owner" ON seller_subscriptions FOR ALL USING (seller_id = auth.uid());
CREATE POLICY "seller_subscriptions_admin" ON seller_subscriptions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- referral_codes: owner all
CREATE POLICY "referral_codes_owner" ON referral_codes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "referral_codes_admin" ON referral_codes FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- referral_tracking: referrer read, admin all
CREATE POLICY "referral_tracking_referrer" ON referral_tracking FOR SELECT USING (referrer_id = auth.uid());
CREATE POLICY "referral_tracking_admin" ON referral_tracking FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- notification_preferences: owner all
CREATE POLICY "notification_prefs_owner" ON notification_preferences FOR ALL USING (user_id = auth.uid());

-- api_keys: owner all
CREATE POLICY "api_keys_owner" ON api_keys FOR ALL USING (user_id = auth.uid());

-- webhooks: owner all
CREATE POLICY "webhooks_owner" ON webhooks FOR ALL USING (user_id = auth.uid());