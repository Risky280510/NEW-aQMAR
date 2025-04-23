-- Drop the existing sales_order_items table
DROP TABLE IF EXISTS sales_order_items;

-- Recreate sales_order_items table with correct data type for sales_order_id
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id BIGINT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  size_id BIGINT NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

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

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE sales_order_items;