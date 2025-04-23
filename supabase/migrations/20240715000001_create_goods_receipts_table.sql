-- Create goods_receipts table
CREATE TABLE IF NOT EXISTS goods_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reference_number TEXT NOT NULL,
  supplier TEXT,
  bun_count INTEGER NOT NULL DEFAULT 0,
  location_id UUID REFERENCES locations(id),
  product_id UUID REFERENCES products(id),
  color_id UUID REFERENCES colors(id),
  user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow select for all users" ON goods_receipts;
CREATE POLICY "Allow select for all users"
  ON goods_receipts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON goods_receipts;
CREATE POLICY "Allow insert for authenticated users"
  ON goods_receipts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime
alter publication supabase_realtime add table goods_receipts;