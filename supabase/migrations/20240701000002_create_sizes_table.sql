-- Create sizes table
CREATE TABLE IF NOT EXISTS sizes (
  id SERIAL PRIMARY KEY,
  size_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row-level security (RLS)
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
DROP POLICY IF EXISTS "Public access" ON sizes;
CREATE POLICY "Public access"
ON sizes FOR SELECT
USING (true);

-- Create policy for authenticated users to insert/update/delete
DROP POLICY IF EXISTS "Authenticated users can modify" ON sizes;
CREATE POLICY "Authenticated users can modify"
ON sizes FOR ALL
USING (auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sizes;

-- Insert initial data
INSERT INTO sizes (size_name) VALUES
('38'),
('39'),
('40'),
('41'),
('42'),
('43'),
('S'),
('M'),
('L'),
('XL')
ON CONFLICT (id) DO NOTHING;
