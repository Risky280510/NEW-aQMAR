-- Create inventory_dus_konversi table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_dus_konversi (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  stok_dus_siap_diproses INTEGER NOT NULL DEFAULT 0,
  total_pasang_diharapkan INTEGER NOT NULL DEFAULT 0,
  total_pasang_terinput INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, product_id, color_id)
);

-- Add comment to the table
COMMENT ON TABLE inventory_dus_konversi IS 'Tracks boxes that have been converted from inventory_dus and are ready for counting into pairs';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_inventory_dus_konversi_location_product_color ON inventory_dus_konversi(location_id, product_id, color_id);

-- Enable row-level security
ALTER TABLE inventory_dus_konversi ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_dus_konversi
DROP POLICY IF EXISTS "inventory_dus_konversi select policy" ON inventory_dus_konversi;
CREATE POLICY "inventory_dus_konversi select policy" ON inventory_dus_konversi
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "inventory_dus_konversi insert policy" ON inventory_dus_konversi;
CREATE POLICY "inventory_dus_konversi insert policy" ON inventory_dus_konversi
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "inventory_dus_konversi update policy" ON inventory_dus_konversi;
CREATE POLICY "inventory_dus_konversi update policy" ON inventory_dus_konversi
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "inventory_dus_konversi delete policy" ON inventory_dus_konversi;
CREATE POLICY "inventory_dus_konversi delete policy" ON inventory_dus_konversi
  FOR DELETE USING (true);

-- Add to realtime publication
alter publication supabase_realtime add table inventory_dus_konversi;
