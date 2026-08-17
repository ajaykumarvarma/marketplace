-- Add order_files table for digital file delivery tracking
CREATE TABLE IF NOT EXISTS order_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  content_type text NOT NULL,
  download_count integer NOT NULL DEFAULT 0,
  max_downloads integer NOT NULL DEFAULT 5,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone DEFAULT now()
);

-- Add seller_analytics table for caching computed stats
CREATE TABLE IF NOT EXISTS seller_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  revenue numeric(12,2) NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  products_sold integer NOT NULL DEFAULT 0,
  unique_buyers integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  UNIQUE (seller_id, date)
);

-- Enable RLS
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;

-- RLS: buyers and sellers can see files for their orders
CREATE POLICY "order_files_order_participants" ON order_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_files.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- RLS: sellers can insert files for their orders
CREATE POLICY "order_files_seller_insert" ON order_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_files.order_id 
      AND orders.seller_id = auth.uid()
    )
  );

-- RLS: sellers own analytics
CREATE POLICY "seller_analytics_owner" ON seller_analytics
  FOR ALL USING (seller_id = auth.uid());