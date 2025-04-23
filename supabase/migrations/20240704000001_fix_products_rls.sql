-- Drop existing policies
DROP POLICY IF EXISTS "Public products access" ON products;

-- Create comprehensive policies for products table
-- Allow anyone to select products
CREATE POLICY "Allow select for all users" 
ON products FOR SELECT 
USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Allow insert for authenticated users" 
ON products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products
CREATE POLICY "Allow update for authenticated users" 
ON products FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete products
CREATE POLICY "Allow delete for authenticated users" 
ON products FOR DELETE 
USING (auth.role() = 'authenticated');
