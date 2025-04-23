-- Drop existing policy
DROP POLICY IF EXISTS "Public locations access" ON locations;

-- Create comprehensive policies for locations table
-- Allow anyone to select locations
CREATE POLICY "Allow select for all users" 
ON locations FOR SELECT 
USING (true);

-- Allow authenticated users to insert locations
CREATE POLICY "Allow insert for authenticated users" 
ON locations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update locations
CREATE POLICY "Allow update for authenticated users" 
ON locations FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete locations
CREATE POLICY "Allow delete for authenticated users" 
ON locations FOR DELETE 
USING (auth.role() = 'authenticated');
