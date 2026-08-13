-- Create disputes table with correct syntax
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  buyer_id uuid NOT NULL REFERENCES auth.users(id),
  seller_id uuid NOT NULL REFERENCES auth.users(id),
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disputes_buyer" ON disputes FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "disputes_seller" ON disputes FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "disputes_admin" ON disputes FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "disputes_insert" ON disputes FOR INSERT WITH CHECK (auth.uid() = buyer_id);