-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'buyer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text NULL;

-- Update status check to include inactive
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('active', 'paused', 'sold_out', 'inactive'));

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old profile policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Profiles policies
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Categories: public read
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);

-- Products: public read active, sellers CRUD own
CREATE POLICY "products_public_read" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "products_seller_select" ON products FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "products_seller_insert" ON products FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "products_seller_update" ON products FOR UPDATE USING (seller_id = auth.uid());
CREATE POLICY "products_seller_delete" ON products FOR DELETE USING (seller_id = auth.uid());

-- Orders: buyers and sellers see own
CREATE POLICY "orders_buyer_select" ON orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "orders_seller_select" ON orders FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "orders_buyer_insert" ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Reviews: public read, own insert
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_reviewer_insert" ON reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Cart items: user CRUD own
CREATE POLICY "cart_items_user_select" ON cart_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cart_items_user_insert" ON cart_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cart_items_user_update" ON cart_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "cart_items_user_delete" ON cart_items FOR DELETE USING (user_id = auth.uid());

-- Fraud logs: admin readable (using raw_user_meta_data since role column exists)
CREATE POLICY "fraud_logs_admin_read" ON fraud_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);