-- Create stock_transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  transfer_number TEXT UNIQUE NOT NULL,
  transfer_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_location_id BIGINT NOT NULL REFERENCES locations(id),
  destination_location_id BIGINT NOT NULL REFERENCES locations(id),
  notes TEXT,
  status TEXT DEFAULT 'Dikirim',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create stock_transfer_items table
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  stock_transfer_id BIGINT NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  color_id BIGINT NOT NULL REFERENCES colors(id),
  size_id BIGINT REFERENCES sizes(id),
  transfer_type TEXT NOT NULL CHECK(transfer_type IN ('dus', 'pasang')),
  quantity INTEGER NOT NULL CHECK(quantity > 0)
);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE stock_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_transfer_items;

-- Create RLS policies for stock_transfers
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all stock transfers" ON stock_transfers;
CREATE POLICY "Users can view all stock transfers"
  ON stock_transfers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert stock transfers" ON stock_transfers;
CREATE POLICY "Users can insert stock transfers"
  ON stock_transfers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update stock transfers" ON stock_transfers;
CREATE POLICY "Users can update stock transfers"
  ON stock_transfers FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can delete stock transfers" ON stock_transfers;
CREATE POLICY "Users can delete stock transfers"
  ON stock_transfers FOR DELETE
  USING (true);

-- Create RLS policies for stock_transfer_items
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all stock transfer items" ON stock_transfer_items;
CREATE POLICY "Users can view all stock transfer items"
  ON stock_transfer_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert stock transfer items" ON stock_transfer_items;
CREATE POLICY "Users can insert stock transfer items"
  ON stock_transfer_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update stock transfer items" ON stock_transfer_items;
CREATE POLICY "Users can update stock transfer items"
  ON stock_transfer_items FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can delete stock transfer items" ON stock_transfer_items;
CREATE POLICY "Users can delete stock transfer items"
  ON stock_transfer_items FOR DELETE
  USING (true);