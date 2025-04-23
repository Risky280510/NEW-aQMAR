-- Create sales_order_items table
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stock_transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_number VARCHAR(50) NOT NULL UNIQUE,
  from_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  to_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  transfer_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'sent', 'received', 'partially_received', 'cancelled')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  received_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stock_transfer_items table
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
  quantity_sent INTEGER NOT NULL CHECK (quantity_sent >= 0),
  quantity_received INTEGER CHECK (quantity_received IS NULL OR quantity_received >= 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'received', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales_order_items
DROP POLICY IF EXISTS "Users can view sales_order_items" ON sales_order_items;
CREATE POLICY "Users can view sales_order_items"
ON sales_order_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert sales_order_items" ON sales_order_items;
CREATE POLICY "Users can insert sales_order_items"
ON sales_order_items FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update sales_order_items" ON sales_order_items;
CREATE POLICY "Users can update sales_order_items"
ON sales_order_items FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Users can delete sales_order_items" ON sales_order_items;
CREATE POLICY "Users can delete sales_order_items"
ON sales_order_items FOR DELETE
USING (true);

-- Create RLS policies for stock_transfers
DROP POLICY IF EXISTS "Users can view stock_transfers" ON stock_transfers;
CREATE POLICY "Users can view stock_transfers"
ON stock_transfers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert stock_transfers" ON stock_transfers;
CREATE POLICY "Users can insert stock_transfers"
ON stock_transfers FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update stock_transfers" ON stock_transfers;
CREATE POLICY "Users can update stock_transfers"
ON stock_transfers FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Users can delete stock_transfers" ON stock_transfers;
CREATE POLICY "Users can delete stock_transfers"
ON stock_transfers FOR DELETE
USING (true);

-- Create RLS policies for stock_transfer_items
DROP POLICY IF EXISTS "Users can view stock_transfer_items" ON stock_transfer_items;
CREATE POLICY "Users can view stock_transfer_items"
ON stock_transfer_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert stock_transfer_items" ON stock_transfer_items;
CREATE POLICY "Users can insert stock_transfer_items"
ON stock_transfer_items FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update stock_transfer_items" ON stock_transfer_items;
CREATE POLICY "Users can update stock_transfer_items"
ON stock_transfer_items FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Users can delete stock_transfer_items" ON stock_transfer_items;
CREATE POLICY "Users can delete stock_transfer_items"
ON stock_transfer_items FOR DELETE
USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE sales_order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_transfer_items;