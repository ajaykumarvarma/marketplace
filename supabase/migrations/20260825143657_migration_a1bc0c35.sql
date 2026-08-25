CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price numeric(10,2) NOT NULL,
  triggered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_alerts_owner" ON price_alerts FOR ALL USING (user_id = auth.uid());
CREATE UNIQUE INDEX idx_price_alerts_user_product ON price_alerts(user_id, product_id);