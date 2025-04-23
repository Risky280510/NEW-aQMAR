-- Drop the existing table if it exists
DROP TABLE IF EXISTS goods_receipts;

-- Create goods_receipts table with correct data types
CREATE TABLE IF NOT EXISTS goods_receipts (
  id BIGSERIAL PRIMARY KEY,
  receipt_date DATE NOT NULL,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  bun_count INTEGER NOT NULL,
  supplier TEXT,
  reference_number TEXT,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;

-- Add public access policy
DROP POLICY IF EXISTS "Public goods_receipts access" ON goods_receipts;
CREATE POLICY "Public goods_receipts access" ON goods_receipts FOR SELECT USING (true);

-- Enable realtime
alter publication supabase_realtime add table goods_receipts;
