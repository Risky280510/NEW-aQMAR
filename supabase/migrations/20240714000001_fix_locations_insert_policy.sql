-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON locations;

-- Create insert policy for locations table
CREATE POLICY "Enable insert for authenticated users"
ON locations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Make sure the table has RLS enabled
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
