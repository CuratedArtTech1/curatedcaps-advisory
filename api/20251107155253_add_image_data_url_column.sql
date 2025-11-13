-- Add image_data_url column to artworks table for consistency

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artworks' AND column_name = 'image_data_url'
  ) THEN
    ALTER TABLE artworks ADD COLUMN image_data_url text;
  END IF;
END $$;