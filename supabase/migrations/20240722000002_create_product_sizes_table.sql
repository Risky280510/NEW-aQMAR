-- Create product_sizes table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id INTEGER NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size_id)
);

-- Enable row-level security
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

-- Create policies for product_sizes
DROP POLICY IF EXISTS "Allow select for all users" ON product_sizes;
CREATE POLICY "Allow select for all users"
  ON product_sizes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON product_sizes;
CREATE POLICY "Allow insert for authenticated users"
  ON product_sizes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow update for authenticated users" ON product_sizes;
CREATE POLICY "Allow update for authenticated users"
  ON product_sizes FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow delete for authenticated users" ON product_sizes;
CREATE POLICY "Allow delete for authenticated users"
  ON product_sizes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add realtime support
alter publication supabase_realtime add table product_sizes;

-- Remove the initial data insertion that was causing the foreign key constraint error
-- We'll need to add data after ensuring the sizes exist in the sizes table
