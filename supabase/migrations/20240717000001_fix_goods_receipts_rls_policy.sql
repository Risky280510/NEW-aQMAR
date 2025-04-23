-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public goods_receipts access" ON goods_receipts;
DROP POLICY IF EXISTS "Allow select for all users" ON goods_receipts;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON goods_receipts;

-- Create proper RLS policies for goods_receipts table
CREATE POLICY "Allow select for all users"
  ON goods_receipts FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for all users"
  ON goods_receipts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for all users"
  ON goods_receipts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for all users"
  ON goods_receipts FOR DELETE
  USING (true);
