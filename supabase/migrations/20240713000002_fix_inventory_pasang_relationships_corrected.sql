-- Create foreign key constraints for inventory_pasang table
ALTER TABLE inventory_pasang
  ADD CONSTRAINT inventory_pasang_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES products(id);

ALTER TABLE inventory_pasang
  ADD CONSTRAINT inventory_pasang_color_id_fkey
  FOREIGN KEY (color_id)
  REFERENCES colors(id);

ALTER TABLE inventory_pasang
  ADD CONSTRAINT inventory_pasang_size_id_fkey
  FOREIGN KEY (size_id)
  REFERENCES sizes(id);

ALTER TABLE inventory_pasang
  ADD CONSTRAINT inventory_pasang_location_id_fkey
  FOREIGN KEY (location_id)
  REFERENCES locations(id);

-- Enable realtime for inventory_pasang table
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_pasang;
