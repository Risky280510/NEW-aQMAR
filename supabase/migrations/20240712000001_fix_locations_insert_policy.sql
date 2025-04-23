-- Fix locations table RLS policies to allow inserts
DROP POLICY IF EXISTS "locations insert policy" ON locations;
CREATE POLICY "locations insert policy" ON locations
  FOR INSERT WITH CHECK (true);

-- Ensure select policy exists
DROP POLICY IF EXISTS "locations select policy" ON locations;
CREATE POLICY "locations select policy" ON locations
  FOR SELECT USING (true);

-- Ensure update policy exists
DROP POLICY IF EXISTS "locations update policy" ON locations;
CREATE POLICY "locations update policy" ON locations
  FOR UPDATE USING (true);

-- Ensure delete policy exists
DROP POLICY IF EXISTS "locations delete policy" ON locations;
CREATE POLICY "locations delete policy" ON locations
  FOR DELETE USING (true);
