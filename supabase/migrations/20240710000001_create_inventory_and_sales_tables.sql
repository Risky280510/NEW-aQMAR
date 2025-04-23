-- Create inventory_dus_konversi table
CREATE TABLE IF NOT EXISTS inventory_dus_konversi (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  stok_dus_siap_diproses INTEGER NOT NULL DEFAULT 0 CHECK (stok_dus_siap_diproses >= 0),
  total_pasang_diharapkan INTEGER NOT NULL DEFAULT 0 CHECK (total_pasang_diharapkan >= 0),
  total_pasang_terinput INTEGER NOT NULL DEFAULT 0 CHECK (total_pasang_terinput >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (location_id, product_id, color_id)
);

-- Enable RLS for inventory_dus_konversi
ALTER TABLE inventory_dus_konversi ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_dus_konversi
DROP POLICY IF EXISTS "Users can view inventory_dus_konversi" ON inventory_dus_konversi;
CREATE POLICY "Users can view inventory_dus_konversi"
  ON inventory_dus_konversi FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert inventory_dus_konversi" ON inventory_dus_konversi;
CREATE POLICY "Users can insert inventory_dus_konversi"
  ON inventory_dus_konversi FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update inventory_dus_konversi" ON inventory_dus_konversi;
CREATE POLICY "Users can update inventory_dus_konversi"
  ON inventory_dus_konversi FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can delete inventory_dus_konversi" ON inventory_dus_konversi;
CREATE POLICY "Users can delete inventory_dus_konversi"
  ON inventory_dus_konversi FOR DELETE
  USING (true);

-- Enable realtime for inventory_dus_konversi
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_dus_konversi;

-- Create inventory_riject table
CREATE TABLE IF NOT EXISTS inventory_riject (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  size_id BIGINT NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reject_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for inventory_riject
ALTER TABLE inventory_riject ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_riject
DROP POLICY IF EXISTS "Users can view inventory_riject" ON inventory_riject;
CREATE POLICY "Users can view inventory_riject"
  ON inventory_riject FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert inventory_riject" ON inventory_riject;
CREATE POLICY "Users can insert inventory_riject"
  ON inventory_riject FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update inventory_riject" ON inventory_riject;
CREATE POLICY "Users can update inventory_riject"
  ON inventory_riject FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can delete inventory_riject" ON inventory_riject;
CREATE POLICY "Users can delete inventory_riject"
  ON inventory_riject FOR DELETE
  USING (true);

-- Enable realtime for inventory_riject
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_riject;

-- Create sales_orders table
CREATE TABLE IF NOT EXISTS sales_orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for sales_orders
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales_orders
DROP POLICY IF EXISTS "Users can view sales_orders" ON sales_orders;
CREATE POLICY "Users can view sales_orders"
  ON sales_orders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert sales_orders" ON sales_orders;
CREATE POLICY "Users can insert sales_orders"
  ON sales_orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update sales_orders" ON sales_orders;
CREATE POLICY "Users can update sales_orders"
  ON sales_orders FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can delete sales_orders" ON sales_orders;
CREATE POLICY "Users can delete sales_orders"
  ON sales_orders FOR DELETE
  USING (true);

-- Enable realtime for sales_orders
ALTER PUBLICATION supabase_realtime ADD TABLE sales_orders;