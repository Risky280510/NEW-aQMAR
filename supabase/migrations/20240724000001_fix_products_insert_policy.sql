-- Fix products table RLS policies to allow inserts
DROP POLICY IF EXISTS "products insert policy" ON products;
CREATE POLICY "products insert policy" ON products
  FOR INSERT WITH CHECK (true);

-- Ensure select policy exists
DROP POLICY IF EXISTS "products select policy" ON products;
CREATE POLICY "products select policy" ON products
  FOR SELECT USING (true);

-- Ensure update policy exists
DROP POLICY IF EXISTS "products update policy" ON products;
CREATE POLICY "products update policy" ON products
  FOR UPDATE USING (true);

-- Ensure delete policy exists
DROP POLICY IF EXISTS "products delete policy" ON products;
CREATE POLICY "products delete policy" ON products
  FOR DELETE USING (true);
