ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_until timestamptz;