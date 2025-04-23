-- Create app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  app_name TEXT NOT NULL,
  company_name TEXT,
  address TEXT,
  logo_url TEXT,
  default_currency TEXT,
  date_format TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row-level security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for app_settings
DROP POLICY IF EXISTS "Allow select for all users" ON app_settings;
CREATE POLICY "Allow select for all users"
  ON app_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON app_settings;
CREATE POLICY "Allow insert for authenticated users"
  ON app_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow update for authenticated users" ON app_settings;
CREATE POLICY "Allow update for authenticated users"
  ON app_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Add realtime support
alter publication supabase_realtime add table app_settings;
