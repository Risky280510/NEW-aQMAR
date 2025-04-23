-- Fix RLS policies for colors table to allow inserts, updates, and deletes

-- Enable RLS on colors table if not already enabled
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public colors select" ON colors;
DROP POLICY IF EXISTS "Public colors insert" ON colors;
DROP POLICY IF EXISTS "Public colors update" ON colors;
DROP POLICY IF EXISTS "Public colors delete" ON colors;

-- Create policies that allow all operations
CREATE POLICY "Public colors select" ON colors FOR SELECT USING (true);
CREATE POLICY "Public colors insert" ON colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public colors update" ON colors FOR UPDATE USING (true);
CREATE POLICY "Public colors delete" ON colors FOR DELETE USING (true);
