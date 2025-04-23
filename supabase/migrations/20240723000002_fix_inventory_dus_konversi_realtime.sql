-- This migration fixes the error by checking if the table is already in the publication
-- Instead of trying to add it again, we'll make sure it exists first

-- Check if the table exists in the publication
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'inventory_dus_konversi'
  ) INTO table_exists;
  
  -- Only add the table if it doesn't exist in the publication
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE inventory_dus_konversi';
  END IF;
END $$;