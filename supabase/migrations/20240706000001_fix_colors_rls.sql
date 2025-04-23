-- Add insert, update, delete policies for colors table
DROP POLICY IF EXISTS "Public colors insert" ON colors;
CREATE POLICY "Public colors insert" ON colors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public colors update" ON colors;
CREATE POLICY "Public colors update" ON colors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public colors delete" ON colors;
CREATE POLICY "Public colors delete" ON colors FOR DELETE USING (true);
