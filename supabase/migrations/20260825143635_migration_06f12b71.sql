CREATE TABLE IF NOT EXISTS product_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key_code text NOT NULL,
  sold boolean NOT NULL DEFAULT false,
  order_id uuid NULL REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_seller_select" ON product_stock FOR SELECT USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_stock.product_id AND products.seller_id = auth.uid())
);

CREATE POLICY "stock_seller_insert" ON product_stock FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_stock.product_id AND products.seller_id = auth.uid())
);

CREATE POLICY "stock_seller_update" ON product_stock FOR UPDATE USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_stock.product_id AND products.seller_id = auth.uid())
);

CREATE POLICY "stock_buyer_select" ON product_stock FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = product_stock.order_id AND orders.buyer_id = auth.uid())
);

CREATE INDEX idx_product_stock_product_id ON product_stock(product_id);
CREATE INDEX idx_product_stock_sold ON product_stock(sold);