-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_select_own" ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_insert_own" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_delete_own" ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE wishlists TO authenticated;
GRANT ALL ON TABLE wishlists TO service_role;