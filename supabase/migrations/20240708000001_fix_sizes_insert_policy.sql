-- Fix RLS policies for sizes table to allow inserts, updates, and deletes

-- Enable RLS on sizes table if not already enabled
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public sizes select" ON sizes;
DROP POLICY IF EXISTS "Public sizes insert" ON sizes;
DROP POLICY IF EXISTS "Public sizes update" ON sizes;
DROP POLICY IF EXISTS "Public sizes delete" ON sizes;

-- Create policies that allow all operations
CREATE POLICY "Public sizes select" ON sizes FOR SELECT USING (true);
CREATE POLICY "Public sizes insert" ON sizes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public sizes update" ON sizes FOR UPDATE USING (true);
CREATE POLICY "Public sizes delete" ON sizes FOR DELETE USING (true);
