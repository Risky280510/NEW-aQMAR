-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  location_name TEXT NOT NULL UNIQUE,
  location_type TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_dus table
CREATE TABLE IF NOT EXISTS inventory_dus (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  stok_dus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, product_id, color_id)
);

-- Create install_inventory table
CREATE TABLE IF NOT EXISTS install_inventory (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  size_id BIGINT NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
  install_stock INTEGER NOT NULL DEFAULT 0,
  variant_sku TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, product_id, color_id, size_id)
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  color_id BIGINT REFERENCES colors(id) ON DELETE SET NULL,
  size_id BIGINT REFERENCES sizes(id) ON DELETE SET NULL,
  location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
  source_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
  destination_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
  jumlah_dus INTEGER,
  jumlah_pasang INTEGER,
  notes TEXT,
  reference_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create users table (extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT NOT NULL,
  location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_dus ENABLE ROW LEVEL SECURITY;
ALTER TABLE install_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add public access policies (you may want to customize these based on your security requirements)
DROP POLICY IF EXISTS "Public locations access" ON locations;
CREATE POLICY "Public locations access" ON locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public inventory_dus access" ON inventory_dus;
CREATE POLICY "Public inventory_dus access" ON inventory_dus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public install_inventory access" ON install_inventory;
CREATE POLICY "Public install_inventory access" ON install_inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public inventory_transactions access" ON inventory_transactions;
CREATE POLICY "Public inventory_transactions access" ON inventory_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public users access" ON users;
CREATE POLICY "Public users access" ON users FOR SELECT USING (true);

-- Enable realtime for all tables
alter publication supabase_realtime add table locations;
alter publication supabase_realtime add table inventory_dus;
alter publication supabase_realtime add table install_inventory;
alter publication supabase_realtime add table inventory_transactions;
alter publication supabase_realtime add table users;
