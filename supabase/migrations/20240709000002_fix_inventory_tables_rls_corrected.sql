-- Fix RLS policies for multiple inventory-related tables

-- install_inventory table
ALTER TABLE install_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public install_inventory select" ON install_inventory;
DROP POLICY IF EXISTS "Public install_inventory insert" ON install_inventory;
DROP POLICY IF EXISTS "Public install_inventory update" ON install_inventory;
DROP POLICY IF EXISTS "Public install_inventory delete" ON install_inventory;
CREATE POLICY "Public install_inventory select" ON install_inventory FOR SELECT USING (true);
CREATE POLICY "Public install_inventory insert" ON install_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Public install_inventory update" ON install_inventory FOR UPDATE USING (true);
CREATE POLICY "Public install_inventory delete" ON install_inventory FOR DELETE USING (true);

-- inventory_dus table
ALTER TABLE inventory_dus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public inventory_dus select" ON inventory_dus;
DROP POLICY IF EXISTS "Public inventory_dus insert" ON inventory_dus;
DROP POLICY IF EXISTS "Public inventory_dus update" ON inventory_dus;
DROP POLICY IF EXISTS "Public inventory_dus delete" ON inventory_dus;
CREATE POLICY "Public inventory_dus select" ON inventory_dus FOR SELECT USING (true);
CREATE POLICY "Public inventory_dus insert" ON inventory_dus FOR INSERT WITH CHECK (true);
CREATE POLICY "Public inventory_dus update" ON inventory_dus FOR UPDATE USING (true);
CREATE POLICY "Public inventory_dus delete" ON inventory_dus FOR DELETE USING (true);

-- users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public users select" ON users;
DROP POLICY IF EXISTS "Public users insert" ON users;
DROP POLICY IF EXISTS "Public users update" ON users;
DROP POLICY IF EXISTS "Public users delete" ON users;
CREATE POLICY "Public users select" ON users FOR SELECT USING (true);
CREATE POLICY "Public users insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public users update" ON users FOR UPDATE USING (true);
CREATE POLICY "Public users delete" ON users FOR DELETE USING (true);

-- inventory_transactions table
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public inventory_transactions select" ON inventory_transactions;
DROP POLICY IF EXISTS "Public inventory_transactions insert" ON inventory_transactions;
DROP POLICY IF EXISTS "Public inventory_transactions update" ON inventory_transactions;
DROP POLICY IF EXISTS "Public inventory_transactions delete" ON inventory_transactions;
CREATE POLICY "Public inventory_transactions select" ON inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Public inventory_transactions insert" ON inventory_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public inventory_transactions update" ON inventory_transactions FOR UPDATE USING (true);
CREATE POLICY "Public inventory_transactions delete" ON inventory_transactions FOR DELETE USING (true);
